import "source-map-support/register";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import { SQS } from 'aws-sdk';
import schema from "./schema";
import { invokeAWSLambdaPublishError } from '../../utils/slackNotifier';
import qs from 'querystring';
import { sendToSQS } from "src/utils/sendToSQS";
import { LambdaFailLocation } from "src/enums/error.enum";

const publishPaymentMessageToSQS: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event, context
) => {
  console.log(event)
  console.log(context)

  let bodyString = ""
  let dataInJSON = {}
  if (event.body) {
    bodyString = JSON.stringify(event.body)
    dataInJSON = event.body
  }

  if (event.isBase64Encoded && event.body) {
    const buff = Buffer.from(event.body.toString(), "base64");
    const dataStr = buff.toString('utf-8');
    dataInJSON = qs.parse(dataStr)
    bodyString = JSON.stringify(dataInJSON)
  }

  const queueName = <string>process.env.STAGE + '-PaymentCallbackQueue'

  try {
    const sqsSendMessageResponse = await sendToSQS(bodyString, queueName)

    if (sqsSendMessageResponse.$response.error !== null) {
      console.log(bodyString)
      console.log(sqsSendMessageResponse.$response.error)
      const content = JSON.stringify({ body: dataInJSON, error: sqsSendMessageResponse.$response.error, failAtLambdaLocation: LambdaFailLocation.PUBLISH_PAYMENT })
      await invokeAWSLambdaPublishError(content)
    } else {
      console.log(sqsSendMessageResponse.$response.data)
      console.log("If data present, data is sent sucessfully to SQS")
    }
  } catch (e) {
    console.log("error in Publish for SQS")
    console.log(e)
    const content = JSON.stringify({ body: dataInJSON, error: e, failAtLambdaLocation: LambdaFailLocation.PUBLISH_PAYMENT })
    await invokeAWSLambdaPublishError(content)
  }
  return formatJSONResponse({
    message: "ok",
    event: event.body,
  });
};

export const main = middyfy(publishPaymentMessageToSQS);