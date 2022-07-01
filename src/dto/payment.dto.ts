import { Booking } from '../entity/booking.entity';
import { PromotionCode } from '../entity/promotion-code.entity';
import { BankMethod, PaymentItemType, PaymentPurpose, PaymentSource, PaymentStatus } from '../enums/payment.enum';
import { PaymentAdjustmentAction, PaymentAdjustmentOperation, PaymentAdjustmentType } from '../enums/payment-adjustment.enum';
import { DateTime } from 'luxon';

export interface IMonthlyRentPaymentRecord {
    booking: Booking;
    occurance: number;
    contractStartDate: DateTime;
    contractEndDate: DateTime;
    isFirstMonth: boolean;
    includeFirstMonth: boolean;
}

export class PaymentAdjustmentDto {
    id: string;
    amount: number;
    toDisplayAmount?: string;
    toDisplayAlteration?: string;
    operations: PaymentAdjustmentOperation;
    type: PaymentAdjustmentType;
    action: PaymentAdjustmentAction;
    source: PaymentSource;
    toDisplaySource?: string;
    remarks?: string;
    attachmentUrls?: string[];
    userId?: string;
    bookingId?: number;
    paymentId?: string;
    payment?: PaymentDto;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export class PaymentFpxDto {
    id: string;
    referenceCode: string;
    payment: PaymentDto;
    status: PaymentStatus;
    responseMessage?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class ProratedDto {
    amount: number;
    toDisplayAmount?: string;
    toDisplayAlteration?: string;
    remarks?: string;
}

export class PaymentDto {
    id: string;
    booking?: Booking;
    paidOn: Date;
    initialAmount: number;
    amount: number;
    proratedAmount?: number;
    currency: string;
    status: PaymentStatus;
    purpose: PaymentPurpose;
    source: PaymentSource;
    toDisplaySource?: string;
    dueDate: Date;
    lateCharge: boolean;
    lateChargeAmount: number;
    discountAmount: number;
    promotionCode: PromotionCode;
    paymentAdjustments?: PaymentAdjustmentDto[];
    paymentFpxs?: PaymentFpxDto[];
    isProrated?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Bank {
    code: string;
    name: string;
    logo: string;
    displayName: string;
    id: number;
}

export class BankArgs {
    method: BankMethod;
}

export class PaymentInput {
    paymentId: string;
    bankCode: string;
    bankId: number;
}

export class PaymentMandateInput {
    bookingId: number;
    bankCode: string;
    bankId: number;
}

export class PaymentRentalArgs {
    bookingId: number;
    status: PaymentStatus;
}

export class PaymentCallbackStatus {
    id?: number;
    success: boolean;
    message?: string;
}

export class CurlecStatusResponse {
    fpx_buyerBankId: string;
    fpx_txnCurrency: string;
    fpx_type: string;
    fpx_sellerOrderNo: string;
    fpx_fpxTxnTime: string;
    fpx_sellerExOrderNo: number;
    fpx_buyerName: string;
    fpx_sellerId: string;
    fpx_debitAuthCode: string;
    fpx_txnAmount: string;
    payment_method: string;
    fpx_fpxTxnId: string;
}

export class CurlecCreateScheduledCollectionResponse {
    transaction_id: string[];
    schedule_created: string[];
    collection_date: string[];
    collection_status: string[];
    collection_amount: string[];
    schedule_id: string[];
    reference_number: string[];
}

export class CurlecCollectionStatusResponse {
    response_batch: string[];
    collection_date: string[];
    transaction_notes: string[];
    batch_id: string[];
    response_date: string[];
    mandate_reference: string[];
    batch_collection_status_code: string[];
    transaction_type: string[];
    collection_status: string[];
    collection_amount: string[];
    max_amount: string[];
    batch_collection_date: string[];
    transaction_reference: string[];
    collection_status_code: string[];
    batch_collection_event: string[];
}

export class CurlecCollectionBatchStatusList {
    response_batch: string[];
    collection_date: string[];
    collection_status: string[];
    response_date: string[];
    collection_amount: string[];
    max_amount: string[];
    mandate_reference: string[];
    transaction_reference: string[];
    transaction_type: string[];
    collection_status_code: string[];
}

export class CurlecCollectionBatchStatusResponse {
    batch_id: string[];
    batch_collection_date: string[]; //2020-12-10 03:01:00.0
    batch_collection_status_code: string[];
    list: CurlecCollectionBatchStatusList[];
    batch_collection_event: string[];
}

export class PaymentLink {
    url: string;
}

export class PaymentItem {
    dueDate?: Date;
    amount: number;
    toDisplayAmount?: string;
    paidOn?: Date;
    initialAmount?: number;
    proratedAmount?: number;
    toDisplayInitialAmount?: string;
    type: PaymentItemType;
    status: PaymentStatus;
    paymentId?: string;
    paymentStep?: number;
    lateCharge: boolean;
    lateChargeAmount: number;
    discountAmount?: number;
    paymentAdjustments?: PaymentAdjustmentDto[];
    isProrated?: boolean;
    proratedItem?: ProratedDto;
}

export class PaymentListingInitial {
    listingId: number;
    moveInDate: string;
    promotionCode?: string;
}

export class PaymentBookingInitial {
    bookingId: number;
    promotionCode?: string;
}

export class CalculatePaymentBooking {
    bookingId: number;
    price: number;
}

export class InitialCostPrices {
    price: number;
    depositMonth: number;
    utilityDeposit: number;
    depositValue: number;
    utilityDepositValue: number;
    tenancyAgreementFee: number;
    stampingFee: number;
}
