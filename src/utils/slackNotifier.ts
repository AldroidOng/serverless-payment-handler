import axios from 'axios';
import { Lambda } from 'aws-sdk';
import { LambdaFailLocation } from 'src/enums/error.enum';

export type ErrorContent = {
  body;
  error;
  failAtLambdaLocation: string;
};

export const invokeAWSLambdaPublishError = async (content: string) => {
  const lambda = new Lambda()
  const params = {
    FunctionName: `arn:aws:lambda:${process.env.REGION}:${process.env.ACCOUNT_ID}:function:${process.env.SEND_SLACK_NOTIFICATION_LAMBDA_FUNCTION_NAME}`,
    Payload: JSON.stringify(content)
  };

  return await lambda.invoke(params).promise()
}

const send = async (data, slackWebhookURL) => {
  try {
    return await axios.post(
      slackWebhookURL,
      data
    )
  } catch (error) {
    console.log(error);
  }
};

export const error = async (content: ErrorContent) => {
  const { body, error, failAtLambdaLocation } = content
  let slackWebhookURL = process.env.SLACK_PROCESS_PAYMENT_ERROR_WEBHOOK_URL
  switch (failAtLambdaLocation) {
    case LambdaFailLocation.CREATE_RESERVATION_DEAL_PIPEDRIVE:
      slackWebhookURL = process.env.SLACK_CREATE_DEAL_PIPEDRIVE_ERROR_WEBHOOK_URL;
      break;
    case LambdaFailLocation.PROCESS_PAYMENT:
      slackWebhookURL = process.env.SLACK_PROCESS_PAYMENT_ERROR_WEBHOOK_URL;
      break;
    case LambdaFailLocation.PUBLISH_PAYMENT:
      slackWebhookURL = process.env.SLACK_PUBLISH_PAYMENT_ERROR_WEBHOOK_URL;
      break;
    case LambdaFailLocation.SEND_EMAIL_NOTIFICATION:
      slackWebhookURL = process.env.SLACK_SEND_EMAIL_ERROR_WEBHOOK_URL;
      break;
  }

  let bodyString = ""
  if (body) {
    bodyString = JSON.stringify(body)
  }
  let errorString = ""
  if (error) {
    errorString = JSON.stringify(error)
  }

  const errorNotification = {
    attachments: [
      {
        color: '#bb2124',
        fields: [
          {
            title: 'Fail At Lambda Function',
            value: failAtLambdaLocation,
            short: true,
          },
          {
            title: 'Error',
            value: errorString,
            short: true,
          },
          {
            title: 'Content',
            value: bodyString,
            short: true,
          },
        ],
      },
    ],
  };

  return await send(errorNotification, slackWebhookURL);
};
