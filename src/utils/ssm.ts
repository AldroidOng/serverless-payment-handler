import { SSM } from 'aws-sdk'


export async function getPassword(ssm: SSM, name: string): Promise<string | undefined> {
  const result = await ssm.getParameter({ Name: name, WithDecryption: true }).promise()

  return result?.Parameter?.Value
}