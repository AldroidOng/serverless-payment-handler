import schema from "./schema";
// import { AWSFunction } from '../../libs/lambda';
// lambdas/publishPaymentMessageToSQS.handler
console.log(`${__dirname.split(process.cwd())[1].substring(1)}\\handler.main`)
export default {
  handler: `${__dirname.split(process.cwd())[1].substring(1)}\\handler.main`,
  // handler: 'src/function/publishPaymentMessageToSQS/handler.main',
  environment: { NEXT_QUEUE_NAME: process.env.NEXT_QUEUE_NAME },
  events: [
    {
      httpApi: {
        method: 'post',
        path: '/publishPaymentMessageToSQS',
        request: {
          schema: {
            'application/json': schema,
          },
        },
      },
    },
  ],
};

// export default {
//   handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
//   environment: { NEXT_QUEUE_NAME: process.env.NEXT_QUEUE_NAME },
//   events: [
//     {
//       http: {
//         method: 'post',
//         path: 'hello',
//         request: {
//           schema: {
//             'application/json': schema
//           }
//         }
//       }
//     }
//   ]
// } as AWSFunction;