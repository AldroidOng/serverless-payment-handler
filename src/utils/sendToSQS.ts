import { SQS } from 'aws-sdk';

export async function sendToSQS(bodyString: string, queueName: string) {

  const sqs = new SQS()
  const region = <string>process.env.REGION
  const accountId = <string>process.env.ACCOUNT_ID
  const queueUrl = `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`

  const params: SQS.Types.SendMessageRequest = {
    MessageBody: bodyString,
    QueueUrl: queueUrl
  };
  try {
    console.log("sending to SQS")
    return await sqs.sendMessage(params).promise()
  } catch (e) {
    console.log("sending to SQS error")
    console.log(e)
  }
}