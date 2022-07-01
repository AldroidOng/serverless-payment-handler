import * as logdna from '@logdna/logger';
import { once } from 'events';

export enum logType {
  info = 'info',
  error = 'error',
}

export enum status {
  failed = 'Failed',
  success = 'Success',
}

// export const logger = async (text: string | LogObject, type: logType, botType: botType) => {
export const logger = async (content, level?) => {

  const options = {
    // hostname: 'lambda-test'
    app: 'payment-callback-serverless-dev',
    level: 'info', // set a default for when level is not provided in function calls
  };

  if (level) {
    options.level = level
  }

  const logger = logdna.createLogger('LOGDNA_ID_HERE', options);
  logger.log(content)
  await once(logger, 'cleared')
};
