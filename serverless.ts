import type { AWS } from '@serverless/typescript';
// import type { PluginLambdaDeadLetter } from "serverless-plugin-lambda-dead-letter";
// import publishPaymentMessageToSQS from '@functions/publishPaymentMessageToSQS';

const serverlessConfiguration: AWS
  // & PluginLambdaDeadLetter 
  = {
  service: 'payment-gateway-handler',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-offline',
    'serverless-plugin-aws-alerts',
    // 'serverless-lift',
    // 'serverless-plugin-lambda-dead-letter'
  ],
  provider: {
    name: 'aws',
    // stage: "${opt:stage, 'dev'}",
    runtime: 'nodejs14.x',
    region: 'ap-southeast-1',
    // iamRoleStatements: [
    //   {
    //     Effect: 'Allow',
    //     Action: [
    //       'codedeploy:*',
    //   ],
    //     Resource: '*',
    //   },
    // ],
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      REGION: '${self:custom.aws.region}',
      ACCOUNT_ID: "${self:custom.aws.accountId.${opt:stage, 'dev'}}",
      DB_PASSWORD: "${self:custom.secrets.DB_PASSWORD}",
      DB_HOST: "${self:custom.secrets.DB_HOST}",
      DB_USER: "${self:custom.secrets.DB_USER}",
      DB_NAME: "${self:custom.secrets.DB_NAME}",
      DB_PORT: "${self:custom.secrets.DB_PORT}",
      STAGE: "${opt:stage, 'dev'}",
      FRONTEND_DOMAIN: "${self:custom.secrets.FRONTEND_DOMAIN}",
      DEFAULT_COUNTRY_CODE: "${self:custom.secrets.DEFAULT_COUNTRY_CODE}",
      PIPEDRIVE_API_KEY: "${self:custom.secrets.PIPEDRIVE_API_KEY}",
      PIPEDRIVE_COMPANY_DOMAIN: "${self:custom.secrets.PIPEDRIVE_COMPANY_DOMAIN}",
      PIPEDRIVE_ORG_ID: "${self:custom.secrets.PIPEDRIVE_ORG_ID}",
      PIPEDRIVE_PIPELINES_LISTING: "${self:custom.secrets.PIPEDRIVE_PIPELINES_LISTING}",
      PIPEDRIVE_PIPELINES_VIEWING: "${self:custom.secrets.PIPEDRIVE_PIPELINES_VIEWING}",
      PIPEDRIVE_PIPELINES_RESERVATION: "${self:custom.secrets.PIPEDRIVE_PIPELINES_RESERVATION}",
      PIPEDRIVE_PIPELINES_INBOX: "${self:custom.secrets.PIPEDRIVE_PIPELINES_INBOX}",
      LISTING_VIRTUAL_TOUR_CUSTOM_DOMAIN: "${self:custom.secrets.LISTING_VIRTUAL_TOUR_CUSTOM_DOMAIN}",
      LISTING_VIRTUAL_TOUR_CUSTOM_DOMAIN_ENABLED: "${self:custom.secrets.LISTING_VIRTUAL_TOUR_CUSTOM_DOMAIN_ENABLED}",
      AWS_CDN_ASSET_BUCKET: "${self:custom.secrets.AWS_CDN_ASSET_BUCKET}",
      CURLEC_MERCHANT_ID: "${self:custom.secrets.CURLEC_MERCHANT_ID}",
      CURLEC_SERVICE_ENDPOINT_URL: "${self:custom.secrets.CURLEC_SERVICE_ENDPOINT_URL}",
      EMAIL_SERVICE_ENDPOINT_URL: "${self:custom.secrets.EMAIL_SERVICE_ENDPOINT_URL}",
      EMAIL_API_KEY: "${self:custom.secrets.EMAIL_API_KEY}",
      SLACK_PROCESS_PAYMENT_ERROR_WEBHOOK_URL: "${self:custom.secrets.SLACK_PROCESS_PAYMENT_ERROR_WEBHOOK_URL}",
      SLACK_PUBLISH_PAYMENT_ERROR_WEBHOOK_URL: "${self:custom.secrets.SLACK_PUBLISH_PAYMENT_ERROR_WEBHOOK_URL}",
      SLACK_CREATE_DEAL_PIPEDRIVE_ERROR_WEBHOOK_URL: "${self:custom.secrets.SLACK_CREATE_DEAL_PIPEDRIVE_ERROR_WEBHOOK_URL}",
      SLACK_SEND_EMAIL_ERROR_WEBHOOK_URL: "${self:custom.secrets.SLACK_SEND_EMAIL_ERROR_WEBHOOK_URL	}",
      SEND_SLACK_NOTIFICATION_LAMBDA_FUNCTION_NAME: "${self:custom.lambdaFunctions.sendErrorNotification.name}"
    }
  },

  functions: {
    sendErrorNotification: {
      name: "${self:custom.lambdaFunctions.sendErrorNotification.name}",
      handler: 'src/functions/sendErrorNotification/handler.main',
      role: "SendErrorNotificationLambdaRole",
      timeout: 10, // 10 seconds, default is 6 seconds
      vpc: {
        securityGroupIds: [
          "${self:custom.securityGroups.${opt:stage, 'dev'}}.sg1"
        ],
        subnetIds: [
          "${self:custom.subnets.${opt:stage, 'dev'}}.subnet1"
        ]
      },
      events: [
        {
          sns: "arn:aws:sns:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:${self:custom.snsTopicAlertsAlarmName}"
        }
      ],
      // dependsOn: ["PaymentGatewayHandlerAlertsAlarm"]
    },
    publishPaymentCallback: {
      name: "${self:custom.lambdaFunctions.publishPaymentCallback.name}",
      handler: 'src/functions/publishPaymentCallback/handler.main',
      role: "PublishPaymentLambdaRole",
      events: [
        {
          httpApi: {
            method: 'post',
            path: '/webhooks/payment-callback',
          }
        }
      ],
      timeout: 20, // 10 seconds, default is 6 seconds
      vpc: {
        securityGroupIds: [
          "${self:custom.securityGroups.${opt:stage, 'dev'}}.sg1"
        ],
        subnetIds: [
          "${self:custom.subnets.${opt:stage, 'dev'}}.subnet1"
        ]
      },
      dependsOn: ["HttpApi"]
    },
    processPaymentCallback: {
      name: "${self:custom.lambdaFunctions.processPaymentCallback.name}",
      handler: 'src/functions/processPaymentCallback/handler.main',
      role: "ProcessPaymentLambdaRole",
      events: [
        {
          sqs: {
            arn: "arn:aws:sqs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:${opt:stage, 'dev'}-${self:custom.sqsQueues.PaymentCallbackQueue.name}"
          }
        }
      ],
      maximumRetryAttempts: 0,
      timeout: 30, // 30 seconds, default is 6 seconds
      vpc: {
        securityGroupIds: [
          "${self:custom.securityGroups.${opt:stage, 'dev'}}.sg1"
        ],
        subnetIds: [
          "${self:custom.subnets.${opt:stage, 'dev'}}.subnet1"
        ]
      },
      dependsOn: ["PaymentCallbackQueue"]
    },
    sendEmailNotification: {
      name: "${self:custom.lambdaFunctions.sendEmailNotification.name}",
      handler: 'src/functions/sendEmailNotification/handler.main',
      role: "SendEmailNotificationLambdaRole",
      events: [
        {
          sqs: {
            arn: "arn:aws:sqs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:${opt:stage, 'dev'}-${self:custom.sqsQueues.SendEmailNotificationQueue.name}"
          }
        }
      ],
      maximumRetryAttempts: 0,
      timeout: 30, // 30 seconds, default is 6 seconds
      vpc: {
        securityGroupIds: [
          "${self:custom.securityGroups.${opt:stage, 'dev'}}.sg1"
        ],
        subnetIds: [
          "${self:custom.subnets.${opt:stage, 'dev'}}.subnet1"
        ]
      },
      dependsOn: ["SendEmailNotificationQueue"]
    },
    createReservationDealInPipedrive: {
      name: "${self:custom.lambdaFunctions.createReservationDealInPipedrive.name}",
      handler: 'src/functions/createReservationDealInPipedrive/handler.main',
      role: "CreateReservationDealInPipedriveLambdaRole",
      events: [
        {
          sqs: {
            arn: "arn:aws:sqs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:${opt:stage, 'dev'}-${self:custom.sqsQueues.CreateReservationDealInPipedriveQueue.name}"
          }
        }
      ],
      maximumRetryAttempts: 0,
      // 30 seconds set for lambda timeout, default is 6 seconds 
      // make sure that the timeout is not longer than the sqs visibility timeout 
      // SQS visibility timeout (default is 30 seconds) is to prevent other consumers from processing the message again 
      timeout: 30,
      vpc: {
        securityGroupIds: [
          "${self:custom.securityGroups.${opt:stage, 'dev'}}.sg1"
        ],
        subnetIds: [
          "${self:custom.subnets.${opt:stage, 'dev'}}.subnet1"
        ]
      },
      dependsOn: ["CreateReservationDealInPipedriveQueue"]
    },
  },

  resources: {
    Resources: {
      // PaymentGatewayHandlerAlertsAlarm: {
      //   Type: "AWS::SNS::Topic",
      //   Properties: {
      //     Subscription: [{
      //       Endpoint: "arn:aws:lambda:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:function:${self:custom.lambdaFunctions.sendErrorNotification.name}",
      //       Protocol: "lambda"
      //     }],
      //     TopicName: "${self:custom.snsTopicAlertsAlarmName}"
      //   }
      // },


      PublishPaymentLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "PublishPaymentLambdaRole",
          AssumeRolePolicyDocument: {
            "Version": "2012-10-17",
            "Statement": [
              {
                "Effect": "Allow",
                "Principal": {
                  "Service": [
                    "lambda.amazonaws.com"
                  ]
                },
                "Action": [
                  "sts:AssumeRole"
                ]
              }
            ]
          },
          Policies: [
            {
              "PolicyName": "PublishPaymentLambdaPolicy",
              "PolicyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                  {
                    "Action": [
                      "logs:CreateLogStream",
                      "logs:CreateLogGroup"
                    ],
                    "Resource": [
                      "arn:aws:logs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:log-group:/aws/lambda/payment-gateway-handler-${opt:stage, 'dev'}*:*"
                    ],
                    "Effect": "Allow"
                  },
                  {
                    "Action": [
                      "logs:PutLogEvents"
                    ],
                    "Resource": [
                      "arn:aws:logs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:log-group:/aws/lambda/payment-gateway-handler-${opt:stage, 'dev'}*:*:*"
                    ],
                    "Effect": "Allow"
                  },
                  {
                    "Action": [
                      "codedeploy:*",
                      "sqs:*",
                      "ec2:DescribeNetworkInterfaces",
                      "ec2:CreateNetworkInterface",
                      "ec2:DeleteNetworkInterface",
                      "ec2:DescribeInstances",
                      "ec2:AttachNetworkInterface",
                      "ec2:DescribeSecurityGroups",
                      "ec2:DescribeSubnets",
                      "ec2:DescribeVpcs",
                    ],
                    "Resource": "*",
                    "Effect": "Allow"
                  },
                  {
                    "Action": [
                      "sqs:ReceiveMessage",
                      "sqs:DeleteMessage",
                      "sqs:GetQueueAttributes"
                    ],
                    "Resource": [
                      "arn:aws:sqs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:${opt:stage, 'dev'}-${self:custom.sqsQueues.PaymentCallbackQueue.name}"
                    ],
                    "Effect": "Allow"
                  }
                ]
              }
            }
          ],
          // ManagedPolicyArns: ["arn:aws:iam::aws:policy/AmazonSQSFullAccess"],
          ManagedPolicyArns: [
            "arn:aws:iam::aws:policy/service-role/AWSLambdaRole",
            "arn:aws:iam::aws:policy/AWSLambdaExecute",
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
            "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
          ],
        }
      },
      CreateReservationDealInPipedriveLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "CreateReservationDealInPipedriveLambdaRole",
          AssumeRolePolicyDocument: {
            "Version": "2012-10-17",
            "Statement": [
              {
                "Effect": "Allow",
                "Principal": {
                  "Service": [
                    "lambda.amazonaws.com",
                  ]
                },
                "Action": [
                  "sts:AssumeRole",
                ],
              }
            ]
          },
          Policies: [
            {
              "PolicyName": "CreateReservationDealInPipedriveLambdaPolicy",
              "PolicyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                  {
                    "Action": [
                      "logs:CreateLogStream",
                      "logs:CreateLogGroup"
                    ],
                    "Resource": [
                      "arn:aws:logs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:log-group:/aws/lambda/payment-gateway-handler-${opt:stage, 'dev'}*:*"
                    ],
                    "Effect": "Allow"
                  },
                  {
                    "Action": [
                      "logs:PutLogEvents"
                    ],
                    "Resource": [
                      "arn:aws:logs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:log-group:/aws/lambda/payment-gateway-handler-${opt:stage, 'dev'}*:*"
                    ],
                    "Effect": "Allow"
                  },
                  {
                    "Action": [
                      "sqs:*",
                      "codedeploy:*",
                      "ec2:DescribeSecurityGroups",
                      "ec2:DescribeSubnets",
                      "ec2:DescribeVpcs",
                    ],
                    "Resource": "*",
                    "Effect": "Allow"
                  },
                ]
              }
            }
          ],
          ManagedPolicyArns: [
            "arn:aws:iam::aws:policy/service-role/AWSLambdaRole",
            "arn:aws:iam::aws:policy/AWSLambdaExecute",
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
            "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
          ],
        }
      },
      SendEmailNotificationLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "SendEmailNotificationLambdaRole",
          AssumeRolePolicyDocument: {
            "Version": "2012-10-17",
            "Statement": [
              {
                "Effect": "Allow",
                "Principal": {
                  "Service": [
                    "lambda.amazonaws.com",
                  ]
                },
                "Action": [
                  "sts:AssumeRole",
                ],
              }
            ]
          },
          Policies: [
            {
              "PolicyName": "SendEmailNotificationLambdaPolicy",
              "PolicyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                  {
                    "Action": [
                      "logs:CreateLogStream",
                      "logs:CreateLogGroup"
                    ],
                    "Resource": [
                      "arn:aws:logs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:log-group:/aws/lambda/payment-gateway-handler-${opt:stage, 'dev'}*:*"
                    ],
                    "Effect": "Allow"
                  },
                  {
                    "Action": [
                      "logs:PutLogEvents"
                    ],
                    "Resource": [
                      "arn:aws:logs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:log-group:/aws/lambda/payment-gateway-handler-${opt:stage, 'dev'}*:*"
                    ],
                    "Effect": "Allow"
                  },
                  {
                    "Action": [
                      "sqs:*",
                      "codedeploy:*",
                      "ec2:DescribeSecurityGroups",
                      "ec2:DescribeSubnets",
                      "ec2:DescribeVpcs",
                    ],
                    "Resource": "*",
                    "Effect": "Allow"
                  },
                ]
              }
            }
          ],
          ManagedPolicyArns: [
            "arn:aws:iam::aws:policy/service-role/AWSLambdaRole",
            "arn:aws:iam::aws:policy/AWSLambdaExecute",
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
            "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
          ],
        }
      },
      SendErrorNotificationLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "SendErrorNotificationLambdaRole",
          AssumeRolePolicyDocument: {
            "Version": "2012-10-17",
            "Statement": [
              {
                "Effect": "Allow",
                "Principal": {
                  "Service": [
                    "lambda.amazonaws.com",
                  ]
                },
                "Action": [
                  "sts:AssumeRole",
                ],
              }
            ]
          },
          Policies: [
            {
              "PolicyName": "SendErrorNotificationLambdaPolicy",
              "PolicyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                  {
                    "Action": [
                      "logs:CreateLogStream",
                      "logs:CreateLogGroup"
                    ],
                    "Resource": [
                      "arn:aws:logs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:log-group:/aws/lambda/payment-gateway-handler-${opt:stage, 'dev'}*:*"
                    ],
                    "Effect": "Allow"
                  },
                  {
                    "Action": [
                      "logs:PutLogEvents"
                    ],
                    "Resource": [
                      "arn:aws:logs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:log-group:/aws/lambda/payment-gateway-handler-${opt:stage, 'dev'}*:*"
                    ],
                    "Effect": "Allow"
                  },
                  {
                    "Action": [
                      "codedeploy:*",
                      "ec2:DescribeSecurityGroups",
                      "ec2:DescribeSubnets",
                      "ec2:DescribeVpcs",
                    ],
                    "Resource": "*",
                    "Effect": "Allow"
                  },
                ]
              }
            }
          ],
          ManagedPolicyArns: [
            "arn:aws:iam::aws:policy/AmazonSNSFullAccess",
            "arn:aws:iam::aws:policy/service-role/AWSLambdaRole",
            "arn:aws:iam::aws:policy/AWSLambdaExecute",
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
            "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
          ],
        }
      },
      ProcessPaymentLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "ProcessPaymentLambdaRole",
          AssumeRolePolicyDocument: {
            "Version": "2012-10-17",
            "Statement": [
              {
                "Effect": "Allow",
                "Principal": {
                  "Service": [
                    "lambda.amazonaws.com",
                    "ssm.amazonaws.com"
                  ]
                },
                "Action": [
                  "sts:AssumeRole",
                ],
              }
            ]
          },
          Policies: [
            {
              "PolicyName": "ProcessPaymentLambdaPolicy",
              "PolicyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                  {
                    "Action": [
                      "logs:CreateLogStream",
                      "logs:CreateLogGroup"
                    ],
                    "Resource": [
                      "arn:aws:logs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:log-group:/aws/lambda/payment-gateway-handler-${opt:stage, 'dev'}*:*"
                    ],
                    "Effect": "Allow"
                  },
                  {
                    "Action": [
                      "logs:PutLogEvents"
                    ],
                    "Resource": [
                      "arn:aws:logs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:log-group:/aws/lambda/payment-gateway-handler-${opt:stage, 'dev'}*:*:*"
                    ],
                    "Effect": "Allow"
                  },
                  {
                    "Action": [
                      "codedeploy:*",
                      "sqs:*",
                      "ssm:*",
                      "kms:*",
                      "ec2:DescribeNetworkInterfaces",
                      "ec2:CreateNetworkInterface",
                      "ec2:DeleteNetworkInterface",
                      "ec2:DescribeInstances",
                      "ec2:AttachNetworkInterface",
                      "ec2:DescribeSecurityGroups",
                      "ec2:DescribeSubnets",
                      "ec2:DescribeVpcs",
                    ],
                    "Resource": "*",
                    "Effect": "Allow"
                  },
                  {
                    "Action": [
                      "sqs:ReceiveMessage",
                      "sqs:DeleteMessage",
                      "sqs:GetQueueAttributes"
                    ],
                    "Resource": [
                      "arn:aws:sqs:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:dev-${self:custom.sqsQueues.PaymentCallbackQueue.name}"
                    ],
                    "Effect": "Allow"
                  }
                ]
              }
            }
          ],
          ManagedPolicyArns: [
            "arn:aws:iam::aws:policy/service-role/AWSLambdaRole",
            "arn:aws:iam::aws:policy/AWSLambdaExecute",
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
            "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
          ],
        }
      },
      PaymentCallbackDeadLetterQueue: {
        Type: "AWS::SQS::Queue",
        Properties:
        {
          QueueName: "${opt:stage, 'dev'}-PaymentCallbackDeadLetterQueue",
        }
      },

      PaymentCallbackQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${opt:stage, 'dev'}-${self:custom.sqsQueues.PaymentCallbackQueue.name}",
          RedrivePolicy: {
            deadLetterTargetArn: { 'Fn::GetAtt': ["PaymentCallbackDeadLetterQueue", "Arn"] },
            maxReceiveCount: 1
          },

        },
        DependsOn: ["PaymentCallbackDeadLetterQueue"],
      },

      SendEmailNotificationDeadLetterQueue: {
        Type: "AWS::SQS::Queue",
        Properties:
        {
          QueueName: "${opt:stage, 'dev'}-SendEmailNotificationDeadLetterQueue",
        }
      },

      SendEmailNotificationQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${opt:stage, 'dev'}-${self:custom.sqsQueues.SendEmailNotificationQueue.name}",
          RedrivePolicy: {
            deadLetterTargetArn: { 'Fn::GetAtt': ["SendEmailNotificationDeadLetterQueue", "Arn"] },
            maxReceiveCount: 1
          },

        },
        DependsOn: ["SendEmailNotificationDeadLetterQueue"],
      },

      CreateReservationDealInPipedriveQueueDeadLetterQueue: {
        Type: "AWS::SQS::Queue",
        Properties:
        {
          QueueName: "${opt:stage, 'dev'}-CreateReservationDealInPipedriveQueueDeadLetterQueue",
        }
      },

      CreateReservationDealInPipedriveQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${opt:stage, 'dev'}-${self:custom.sqsQueues.CreateReservationDealInPipedriveQueue.name}",
          RedrivePolicy: {
            deadLetterTargetArn: { 'Fn::GetAtt': ["CreateReservationDealInPipedriveQueueDeadLetterQueue", "Arn"] },
            maxReceiveCount: 1
          },

        },
        DependsOn: ["CreateReservationDealInPipedriveQueueDeadLetterQueue"],
      },

      // HttpApi: {
      //   Type: "AWS::ApiGatewayV2::Api",
      //   Properties: {
      //     Name: "ServerlessPaymentGatewayCallbackHandler",
      //     Description: "Serverless generated HTTP Protocol for payment gateway",
      //     ProtocolType: "HTTP",
      //     Version: "1.0",
      //     // Target: { "Ref": "publishPaymentMessageToSQS" }
      //   },
      //   // DependsOn: ["publishPaymentMessageToSQS"]
      // },
      // HttpDeployment: {
      //   Type: "AWS::ApiGatewayV2::Deployment",
      //   Properties: {
      //     ApiId: { "Ref": "HttpApi" },
      //     StageName: "dev"
      //   },
      //   DependsOn: ["MyStage"],
      // },
      //   MyStage: {
      //     Type: "AWS::ApiGatewayV2::Stage",
      //     Properties: {
      //       StageName: "${opt:stage, 'dev'}",
      //       ApiId: { "Ref": "HttpApi" },
      //     },
      //     DependsOn: ["HttpApi"]
      //   }
      // },
      // Outputs: {
      //   apiGatewayHTTPApiId: {
      //     Value: { Ref: "HttpApi" },
      //     Export: { Name: "HttpApi-apiId" }
      //   }
    }
  },

  // publishPaymentMessageToSQS },

  package: { individually: true },
  custom: {
    alerts: {
      dashboards: true,
      stages: ["prod", "stg", "dev"],
      topics: {
        alarm: {
          topic: "${self:custom.snsTopicAlertsAlarmName}",
          notifications: [{
            protocol: "lambda",
            endpoint: "arn:aws:lambda:${self:custom.aws.region}:${self:custom.aws.accountId.${opt:stage, 'dev'}}:function:${self:custom.lambdaFunctions.sendErrorNotification.name}"
          }]
        }
      },
      alarms: ["functionErrors", "functionThrottles"]
    },
    aws: {
      region: 'ap-southeast-1',
      accountId: {
        dev: '',
        stg: '',
        prod: ''
      }
    },
    snsTopicAlertsAlarmName: "payment-gateway-handler-${opt:stage, 'dev'}-alerts-alarm",
    lambdaFunctions: {
      sendErrorNotification: { name: "${opt:stage, 'dev'}-SendErrorNotification" },
      publishPaymentCallback: { name: "${opt:stage, 'dev'}-PublishPaymentCallback" },
      processPaymentCallback: { name: "${opt:stage, 'dev'}-ProcessPaymentCallback" },
      sendEmailNotification: { name: "${opt:stage, 'dev'}-SendEmailNotification" },
      createReservationDealInPipedrive: { name: "${opt:stage, 'dev'}-CreateReservationDealInPipedrive" },
    },
    sqsQueues: {
      PaymentCallbackQueue: { name: 'PaymentCallbackQueue' },
      SendEmailNotificationQueue: { name: 'SendEmailNotificationQueue' },
      CreateReservationDealInPipedriveQueue: { name: 'CreateReservationDealInPipedriveQueue' },
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    secrets: "${ssm:/aws/reference/secretsmanager/${opt:stage, 'dev'}/payment-callback-secrets}",
    subnets: {
      dev: {
        subnet1: "",
        subnet2: "",
        subnet3: "",
        privateSubnet1: "",
        privateSubnet2: "",
        privateSubnet3: "",
      },
      stg: {
        subnet1: "",
        subnet2: "",
        subnet3: "",
      },
      prod: {
        subnet1: "",
        subnet2: "",
        subnet3: "",
      }
    },

    securityGroups: {
      dev: {
        sg1: "sg-d6baaf9f"
      },

      stg: {
        sg1: "sg-0a04f8321b9680121"
      },

      prod: {
        sg1: "sg-0a04f8321b9680121"
      }

    }

  },
};

module.exports = serverlessConfiguration;
