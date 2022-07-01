import "source-map-support/register";
import "reflect-metadata";
import { Callback, Context, SQSEvent, SQSHandler } from 'aws-lambda'
import { middyfy } from "@libs/lambda";
import { invokeAWSLambdaPublishError } from '../../utils/slackNotifier';
import axios from 'axios';
import qs from 'querystring';
import { DateTime } from "luxon";
import { CurlecStatusCheckMethod, PaymentItemType, PaymentPurpose, PaymentSource, PaymentStatus } from "../../enums/payment.enum";
import { BookingStatus } from "../../enums/booking.enum";
import { DiscountCategory, DiscountType, PromotionCodeStatus, PromotionStatus } from "../../enums/promotion.enum";
import moment from 'moment-timezone';
import { ListingStatus } from "src/enums/listing.enum";
import { EmailPurpose, EmailTemplate } from "src/enums/email.enum";
import { PipeDriveDealsField } from "src/enums/pipedrive.enum";
import { parseAmenities, parseFurnishingLevel, parseFurniture, parseNotes, parseUnitType } from "src/utils/pipedrive-mapping";
import { LeasingStatus } from "src/enums/leasing.enum";
import { CurlecPaymentCodes } from "src/utils/curlec-payment-code";
import { Database } from '../../typeorm/database'
import { PaymentFpx } from "src/entity/payment-fpx.entity";
import { User } from "src/entity/user.entity";
import { Listing } from "src/entity/listing.entity";
import { DataSource, getManager } from "typeorm";
import { Payment } from "src/entity/payment.entity";
import { CurlecStatusResponse, IMonthlyRentPaymentRecord } from "src/dto/payment.dto";
import { Booking } from "src/entity/booking.entity";
import { Leasing } from "src/entity/leasing.entity";
import { PromotionCode } from "src/entity/promotion-code.entity";
import { Promotion } from "src/entity/promotion.entity";
import { sendToSQS } from "src/utils/sendToSQS";
import { SQSContentForCreateReservationDeal, SQSContentForEmail } from "src/dto/processPaymentCallback.dto";
import { LambdaFailLocation } from "src/enums/error.enum";

const processPaymentMessageFromSQS: SQSHandler = async (event: SQSEvent, context: Context, cb: Callback) => {
  try {
    console.log(event)
    console.log(context)
    console.log("Attempting to connect to DB")
    await Database.initialize()
      .then(() => {
        console.log("DB connected")
      })
      .catch((error) => {
        console.log("DB error")
        console.log(error)
        throw error
      })

    const bodyData = JSON.parse(event.Records[0].body)
    console.log(bodyData)
    console.log("start processing")
    await oneOffPaymentCallback(bodyData, Database)
  } catch (e) {
    console.log(e)
    const content = JSON.stringify({ body: event.Records[0].body, error: e.toString(), failAtLambdaLocation: LambdaFailLocation.PROCESS_PAYMENT })
    console.log(content)
    await invokeAWSLambdaPublishError(content)
    throw e
  } finally {
    await Database.destroy()
  }
}

export const main = middyfy(processPaymentMessageFromSQS);

const oneOffPaymentCallback = async (input, db: DataSource) => {
  const fpxRepository = db.getRepository(PaymentFpx)
  try {
    const { fpx_sellerOrderNo: referenceCode } = input;
    if (!referenceCode) throw new Error('No payment identifier found');

    const [fpxResponseFromCurlec, paymentFpxesData] = await Promise.all([
      // const fpxResponseFromCurlec = await 
      checkStatus(referenceCode, CurlecStatusCheckMethod.instantPay),
      // console.log('getting payment fpx db data')
      // const paymentFpxesData = await 
      fpxRepository.findOne({
        where: { referenceCode },
        relations: [
          'payment',
          'payment.booking',
          'payment.booking.user',
          'payment.booking.leasing',
          'payment.booking.listing',
          'payment.booking.promotionCode',
          'payment.booking.listing.property'
        ],
      })
    ]);

    if (!paymentFpxesData) throw ('No such FPX payment record found with reference code ' + referenceCode);

    const { payment } = paymentFpxesData;
    if (!payment) throw new Error('No such record found with reference code: ', referenceCode);
    const { booking } = payment
    const { listing, leasing, promotionCode, user } = booking
    const responseMessage = getCurlecResponseMessage(fpxResponseFromCurlec);
    const isSuccess = isSuccessCode(fpxResponseFromCurlec);
    const status = isSuccess ? PaymentStatus.success : PaymentStatus.pending;

    if (payment.status === PaymentStatus.pending) {
      if (payment.purpose === PaymentPurpose.initial && isSuccess) { // Booking Related Payment

        await db.manager.transaction(async (transactionalEntityManager) => {
          await transactionalEntityManager.save(
            Payment,
            Object.assign(payment, {
              status,
              source: PaymentSource.fpx,
              ...(isSuccess && { paidOn: moment(new Date()).utc().format() }),
            }),
          )
          await transactionalEntityManager.update(
            PaymentFpx,
            { referenceCode },
            {
              response: fpxResponseFromCurlec,
              responseMessage,
              status: isSuccess ? PaymentStatus.success : PaymentStatus.fail,
            },
          )
          if (booking.status === BookingStatus.IN_PROGRESS) {
            await transactionalEntityManager.update(
              Booking,
              { id: payment.booking.id },
              {
                tenantPaid: true,
                status: BookingStatus.BOOKING_PAID,
              },
            )
          }
          // need to test for this scenario where booking is not attached to any leasing table
          if (!leasing) {
            await transactionalEntityManager.create(
              Leasing,
              Object.assign(
                { listing: { id: listing.id } },
                { booking: { id: booking.id } },
                { user: { id: booking.user.id } },
                { movedInDate: booking.movedInDate },
                { contractEnd: booking.contractEnd },
                { address: listing.address },
                { price: listing.price },
                { utilityDeposit: listing.utilityDeposit },
                { depositMonth: listing.depositMonth },
                { status: LeasingStatus.ACTIVE },
                isContractSignedByAllParties(booking) && { contractLink: booking.contractLink },
              ),
            )
          }
          if (payment?.promotionCode?.code) {
            await transactionalEntityManager.update(
              PromotionCode,
              { code: payment?.promotionCode?.code },
              { usageCount: promotionCode.usageCount + 1 }
            )
          }
        })
        // send to SQS to create reservation deal in pipedrive 
        const createReservationDealQueueName = <string>process.env.STAGE + '-CreateReservationDealInPipedriveQueue'

        const createReservationDealContent: SQSContentForCreateReservationDeal = {
          title: `Reservation made at ${moment().tz("Asia/Kuala_Lumpur").format("ddd MMM DD YYYY")}`,
          bookingId: booking.id,
          crmUserId: user.crmUserId
        }

        const createReservationDealQueueResponse = await sendToSQS(JSON.stringify(createReservationDealContent), createReservationDealQueueName)
        console.log(createReservationDealQueueResponse.$response.data)
        console.log(createReservationDealQueueResponse.$response.error)
        if (createReservationDealQueueResponse.$response.error !== null) {
          throw new Error(JSON.stringify(createReservationDealQueueResponse.$response.error))
        }

        // send to SQS to send email for acknowledgement to tenant via mailchimp after booking paid
        const sendEmailNotificationQueueName = <string>process.env.STAGE + '-SendEmailNotificationQueue'

        const sendEmailNotificationContent: SQSContentForEmail = {
          emailPurpose: EmailPurpose.bookingPaymentSucess,
          userEmail: user.email,
          bookingId: booking.id
        }

        const sendEmailNotificationQueueResponse = await sendToSQS(JSON.stringify(sendEmailNotificationContent), sendEmailNotificationQueueName)

        if (sendEmailNotificationQueueResponse.$response.error !== null) {
          throw new Error(JSON.stringify(sendEmailNotificationQueueResponse.$response.error))
        }

      } else if (payment.purpose === PaymentPurpose.deposit && isSuccess) { // Deposit Related Payment
        const rentalPaymentArrays = await createRentalPaymentArrayRecords(payment, db)

        await db.manager.transaction(async (transactionalEntityManager) => {

          await transactionalEntityManager.save(
            Payment,
            Object.assign(payment, {
              status,
              source: PaymentSource.fpx,
              ...(isSuccess && { paidOn: moment(new Date()).utc().format() }),
            }),
          )

          await transactionalEntityManager.update(
            PaymentFpx,
            { referenceCode },
            {
              response: fpxResponseFromCurlec,
              responseMessage,
              status: isSuccess ? PaymentStatus.success : PaymentStatus.fail,
            },
          )

          // DepositPaidEvent - update booking table after deposit paid
          await transactionalEntityManager.update(
            Booking,
            { id: payment?.booking?.id },
            {
              depositPaid: true,
              status: BookingStatus.DEPOSIT_PAID,
            }
          )

          // DepositPaidEvent - create rental records based on the start date and end date in payments table
          await transactionalEntityManager.save(
            Payment,
            rentalPaymentArrays
          )

          // DepositPaidEvent - update listings table after deposit paid
          await transactionalEntityManager.update(
            Listing,
            { id: booking?.listing?.id },
            { status: ListingStatus.Occupied }
          )
        })

        // send email to tenant upon payment successful
        const queueName = <string>process.env.STAGE + '-SendEmailNotificationQueue'

        const sqsContent = {
          emailPurpose: EmailPurpose.depositPaymentSucess,
          userEmail: user.email,
          bookingId: booking.id
        }

        const sqsSendMessageResponse = await sendToSQS(JSON.stringify(sqsContent), queueName)

        if (sqsSendMessageResponse.$response.error !== null) {
          console.log(sqsSendMessageResponse.$response.error)
          const content = JSON.stringify({ body: sqsContent, error: sqsSendMessageResponse.$response.error, failAtLambdaLocation: 'processPaymentCallback' })
          await invokeAWSLambdaPublishError(content)
        }
      }
      else {
        await db.manager.transaction(async (transactionalEntityManager) => {

          await transactionalEntityManager.save(
            Payment,
            Object.assign(payment, {
              status,
              source: PaymentSource.fpx,
              ...(isSuccess && { paidOn: moment(new Date()).utc().format() }),
            }),
          )

          await transactionalEntityManager.update(
            PaymentFpx,
            { referenceCode },
            {
              response: fpxResponseFromCurlec,
              responseMessage,
              status: isSuccess ? PaymentStatus.success : PaymentStatus.fail,
            },
          )
        })
      }
    }
  } catch (err) {
    console.log(err);
    throw err
  }
}

// Adjust
const checkStatus = async (referenceCode: string, method: CurlecStatusCheckMethod): Promise<CurlecStatusResponse> => {
  const endpoint = process.env.CURLEC_SERVICE_ENDPOINT_URL || "https://demo.curlec.com/curlec-services";
  const payload = qs.stringify({
    method,
    merchantId: parseInt(process.env.CURLEC_MERCHANT_ID) || 3018266,
    order_no: referenceCode,
  });

  try {
    const paymentResponseData = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    const data = paymentResponseData.data

    // this.logger.log(`Response: ${data}`);
    const statusCode = data?.Status?.[0];
    if (statusCode === '200' || statusCode === '201') {
      if (Array.isArray(data?.Response?.[0])) {
        // If its array return then go deeper and return the object
        return data?.Response?.[0]?.[0];
      } else {
        // If its not array, then it will be object, so just return theobject
        throw ('Unable to get data from FPX with order number: ' + referenceCode)
        return data?.Response?.[0];
      }
    }
  } catch (e) {
    console.log(e)
    throw new Error(e);
  }
}

const getCurlecResponseMessage = (curlecResponse: CurlecStatusResponse): string => {
  const responseCode = curlecResponse?.fpx_debitAuthCode?.[0];
  return CurlecPaymentCodes[responseCode].toLowerCase();
}

const isSuccessCode = (curlecResponse): boolean => {
  const responseCode = curlecResponse?.fpx_debitAuthCode?.[0];
  return responseCode === '00'; // code for approval
}


const createRentalPaymentArrayRecords = async (payment: Payment, db: DataSource) => {
  const hasRentalRecordsResult = await hasRentalRecords(payment.booking, db);
  if (hasRentalRecordsResult) return; // idempotent - do not create records if records exist
  const { movedInDate, contractEnd } = payment.booking;
  const startDate = DateTime.fromFormat(movedInDate, 'yyyy-MM-dd');
  const endDate = DateTime.fromFormat(contractEnd, 'yyyy-MM-dd');
  const creationArray = await createRentalPaymentArray({
    booking: payment.booking,
    occurance: 1,
    contractStartDate: startDate,
    contractEndDate: endDate,
    isFirstMonth: true,
    includeFirstMonth: false,
  }, db);
  console.log(creationArray)
  return creationArray;
}

const hasRentalRecords = async (booking: Booking, db: DataSource): Promise<boolean> => {
  const paymentRepository = db.getRepository(Payment)
  const payments = await paymentRepository.find({ where: { purpose: PaymentPurpose.rental, booking: { id: booking.id } } });
  return payments.length > 0;
}

const createRentalPaymentArray = async (monthlyRentPaymentRecord: IMonthlyRentPaymentRecord, db) => {
  const { booking, occurance, contractStartDate, contractEndDate, isFirstMonth, includeFirstMonth } = monthlyRentPaymentRecord;
  let occuranceCounter = occurance;
  const startDate = contractStartDate;
  const endDate = contractEndDate.startOf('month');
  let nextMonth = includeFirstMonth ? startDate.startOf('month') : startDate.plus({ month: 1 }).startOf('month');
  const { isValid, promotionCode } = await getValidPromoCode(booking?.promotionCode?.code, db);

  const creationArray = [];
  const createRecord = (dueDate: Date, occurance, amount = booking.price) => {
    return createMonthlyRentalPayment(booking, dueDate, amount, occurance, isValid ? promotionCode.promotion : null);
  };

  let counter = 1;
  while (nextMonth < endDate) {
    if (isFirstMonth && counter === 1) {
      const secondMonth = getFirstProRatedRent(new Date(contractStartDate.toJSDate()), booking.price);
      creationArray.push(createRecord(nextMonth.toJSDate(), occuranceCounter, secondMonth));
    } else {
      creationArray.push(createRecord(nextMonth.toJSDate(), occuranceCounter));
    }
    occuranceCounter++;
    counter++;
    nextMonth = nextMonth.plus({ month: 1 }).startOf('month');
  }

  const finalMonthAmount = getFinalProRatedRent(new Date(contractEndDate.toJSDate()), booking.price);

  creationArray.push(createRecord(endDate.toJSDate(), occuranceCounter, finalMonthAmount));
  return creationArray;
}

const getValidPromoCode = async (code: string, db: DataSource): Promise<{ isValid: boolean; promotionCode: PromotionCode }> => {
  const promoCodeRepository = db.getRepository(PromotionCode)
  const promo = await promoCodeRepository.findOne({
    where: { code },
    relations: ['promotion', 'promotion.discounts'],
  });
  return {
    isValid: isPromoCodeValid(promo),
    promotionCode: promo,
  };
}

const isPromoCodeValid = (promotionCode: PromotionCode) => {
  if (!promotionCode) return false;
  if (promotionCode.usageCount >= promotionCode.usageLimit) return false;
  if (dateCommencing(promotionCode.promotion.startDate) > new Date()) return false;
  if (dateCommencing(promotionCode.promotion.endDate) < new Date()) return false;
  if (promotionCode.promotion.status !== PromotionStatus.ACTIVE) return false;
  if (promotionCode.status !== PromotionCodeStatus.ACTIVE) return false;
  return true;
}

const dateCommencing = (date: string): Date => {
  return DateTime.fromFormat(date, 'yyyy-MM-dd', { zone: 'Asia/Singapore' }).toJSDate();
}

const createMonthlyRentalPayment = (booking: Booking, dueDate: Date, amount: number, occurance: number, promotion: Promotion) => {
  const discountPayment = getDiscountForPayment(promotion, { type: PaymentItemType.rental, amount }, occurance);
  const initalDiscountPayment = getDiscountForPayment(
    promotion,
    { type: PaymentItemType.rental, amount: booking.price },
    occurance,
  );

  let isProrated = false;

  if (booking.price !== amount) {
    isProrated = true;
  }

  // *(note)ivan: add to factory
  return {
    amount: discountPayment.postDiscountAmount,
    initialAmount: initalDiscountPayment.postDiscountAmount,
    proratedAmount: isProrated ? discountPayment.postDiscountAmount : null,
    booking: { id: booking.id },
    status: PaymentStatus.pending,
    purpose: PaymentPurpose.rental,
    dueDate,
    discountAmount: discountPayment.discountAmount,
    promotionCode: { code: booking?.promotionCode?.code },
    isProrated,
  };
}

const getFirstProRatedRent = (date: Date, price: number): number => {
  const totalMonthDays = daysInMonth(date.getMonth(), date.getFullYear());
  // * (note)ivan: get total staying days including the first day.
  const totalDays = totalMonthDays - date.getDate() + 1;
  const rental = (totalDays / totalMonthDays) * price;

  return roundCurrency(rental);
}

const daysInMonth = (month: number, year: number): number => {
  const nextMonth = month + 1;
  return new Date(year, nextMonth, 0).getDate();
}

const getFinalProRatedRent = (date: Date, price: number): number => {
  const totalMonthDays = daysInMonth(date.getMonth(), date.getFullYear());
  const rental = (date.getDate() / totalMonthDays) * price;
  return roundCurrency(rental);
}

const isContractSignedByAllParties = (booking: Booking) => {
  return booking.tenantSigned && booking.landlordSigned;
}

const getDiscountForPayment = (promotion: Promotion, payment: { type: PaymentItemType; amount: number }, occurance = 1) => {
  if (!promotion?.discounts || promotion?.discounts?.length === 0) {
    return {
      discountAmount: 0,
      postDiscountAmount: payment.amount,
    };
  }

  let totalDiscount = 0;

  for (const discount of promotion.discounts) {
    if (doesDiscountCategoryMatchPaymentType(discount.category, payment.type)) {
      if (!passesOccuranceCheck(discount.occurance, occurance)) {
        continue;
      }
      totalDiscount += getDiscountAmount(discount.discountType, payment.amount, discount.discount, discount.maxDiscount);
    }
  }

  const postDiscountAmount = roundCurrency(payment.amount) - roundCurrency(totalDiscount);

  return {
    discountAmount: checkDiscountAmount(postDiscountAmount, totalDiscount),
    postDiscountAmount: checkPostDiscountAmount(postDiscountAmount),
  };
}

const doesDiscountCategoryMatchPaymentType = (discountCategory: DiscountCategory, paymentItem: PaymentItemType) => {
  if (discountCategory === DiscountCategory.RENTAL && paymentItem === PaymentItemType.rental) return true;
  if (discountCategory === DiscountCategory.SECURITY_DEPOSIT && paymentItem === PaymentItemType.rentalDeposit) return true;
  if (discountCategory === DiscountCategory.UTILITY_DEPOSIT && paymentItem === PaymentItemType.utilityDeposit) return true;
  if (discountCategory === DiscountCategory.ADVANCE_RENTAL && paymentItem === PaymentItemType.advanceRental) return true;
  return false;
}

const passesOccuranceCheck = (maxOccurance, occurance) => {
  // note: maxOccurance is inclusive
  return maxOccurance >= occurance;
}

const getDiscountAmount = (discountType, amount, discountInput, maxDiscount) => {
  if (discountType === DiscountType.PERCENTAGE) return discountByPercentage(amount, discountInput, maxDiscount);
  return discountByNumeric(discountInput, maxDiscount);
}

const discountByPercentage = (amount, discountInput, maxDiscount) => {
  if (!maxDiscount) maxDiscount = 1e10;
  return Math.min(discountInput * amount, maxDiscount);
}

const discountByNumeric = (discountInput, maxDiscount) => {
  if (!maxDiscount) maxDiscount = 1e10;
  return Math.min(discountInput, maxDiscount);
}

const roundCurrency = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

const checkDiscountAmount = (postDiscountAmount: number, totalDiscount: number) => {
  return postDiscountAmount >= 0 ? roundCurrency(totalDiscount) : roundCurrency(postDiscountAmount + totalDiscount);
}

const checkPostDiscountAmount = (postDiscountAmount: number) => {
  return postDiscountAmount >= 0 ? roundCurrency(postDiscountAmount) : 0;
}