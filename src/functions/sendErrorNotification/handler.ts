import "source-map-support/register";

import { middyfy } from "@libs/lambda";
import { error } from "src/utils/slackNotifier";
import { logger, logType } from "src/utils/logger";

const sendErrorNotification = async (event, context) => {
  let content;
  try {
    if (event.hasOwnProperty('Records')) {
      const messageContent = JSON.parse(event.Records[0].Sns.Message);
      let functionName = messageContent.Trigger.Dimensions[0].value
      const splittedFunctionNameWithStage = functionName.split('-');

      if (splittedFunctionNameWithStage.length > 1) {
        functionName = splittedFunctionNameWithStage[1]
      }

      content = { body: { linkToAlarm: 'https://console.aws.amazon.com/cloudwatch/home?region=' + process.env.REGION + '#alarm:alarmFilter=ANY;name=' + encodeURIComponent(messageContent.AlarmName) }, error: messageContent, failAtLambdaLocation: functionName }
    } else {
      content = JSON.parse(event);
    }
  } catch (e) {
    console.log(e);
  }
  console.log(content)

  // Send erorr to logDNA
  await logger(content, logType.error)

  // Send error to Slack Channel
  await error(content)
}

export const main = middyfy(sendErrorNotification);