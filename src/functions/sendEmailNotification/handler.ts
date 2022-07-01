import "source-map-support/register";

import { Database } from '../../typeorm/database'
import { DataSource } from "typeorm";
import { middyfy } from "@libs/lambda";
import axios from 'axios';
import { EmailPurpose, EmailTemplate } from "src/enums/email.enum";
import { SQSContentForEmail } from "src/dto/processPaymentCallback.dto";
import { Email } from "src/entity/email.entity";
import { invokeAWSLambdaPublishError } from "src/utils/slackNotifier";
import { LambdaFailLocation } from "src/enums/error.enum";

const sendEmailNotification = async (event, context) => {
  console.log(event)
  const content: SQSContentForEmail = JSON.parse(event.Records[0].body)

  await Database.initialize()
    .then(() => {
      console.log("DB connected")
    })
    .catch((error) => {
      console.log("DB error here")
      console.log(error)
    })

  try {
    switch (content.emailPurpose) {
      case EmailPurpose.bookingPaymentSucess:
        await sendTenantBookingSent(Database, content.userEmail)
        break;
      case EmailPurpose.depositPaymentSucess:
        await sendTenantBookingPaid(Database, content.userEmail)
        break;
    }
  } catch (e) {
    console.log(e)
    const content = JSON.stringify({ body: event.Records[0].body, error: e.toString(), failAtLambdaLocation: LambdaFailLocation.SEND_EMAIL_NOTIFICATION })
    console.log(content)
    await invokeAWSLambdaPublishError(content)
    throw e
  } finally {
    await Database.destroy()
  }
}

export const main = middyfy(sendEmailNotification);

const sendTenantBookingSent = async (db: DataSource, recipient: string) => {
  const variables = getBaseVariables();
  const input = {
    recipient,
    template: EmailTemplate.tenantBookingSent,
    subject: "We've received your booking",
    variables,
  };
  await sendTemplateEmail(db, input);
}

const sendTenantBookingPaid = async (db: DataSource, recipient: string) => {
  const variables = getBaseVariables();
  const input = {
    recipient,
    template: EmailTemplate.tenantPaid,
    subject: 'See you soon',
    variables,
  };
  await sendTemplateEmail(db, input);
}

const getBaseVariables = () => {
  const variables = [
    {
      name: 'DOMAIN',
      content: process.env.FRONTEND_DOMAIN,
    },
  ];
  return variables.slice(); // shallow clone
}

const sendTemplateEmail = async (db: DataSource, input) => {
  input.text = input.text ? input.text : input.subject;
  input.html = input.html ? input.html : `<p>${input.subject}</p>`;
  console.log("Sending email...")
  const [response] = await sendEmailWithTemplate(input);
  console.log(response)
  try {
    await db.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.create(
        Email,
        {
          recipient: input.recipient,
          type: input.template,
          payload: input,
        }
      )
    })
  } catch (e) {
    console.log(e)
  }
}

const sendEmailWithTemplate = async (input) => {
  try {
    const endpoint = process.env.EMAIL_SERVICE_ENDPOINT_URL;
    const payload = generatePayload(input);
    const { data } = await axios.post(endpoint, payload);
    return data;
  } catch (err) {
    console.log(err)
    return [{ status: 'error' }];
  }
}

// to check
const generatePayload = (input) => {
  const payload = {
    key: process.env.EMAIL_API_KEY,
    template_name: input.template,
    template_content: [],
    message: {
      html: input.html,
      text: input.text,
      subject: input.subject,
      from_email: 'noreply@.com',
      from_name: '',
      to: [
        {
          email: input.recipient,
        },
        input.bcc && { email: input.bcc, type: 'bcc' },
      ].filter(Boolean),
      headers: {},
      important: false,
      track_opens: true,
      track_clicks: true,
      auto_text: true,
      auto_html: true,
      inline_css: true,
      bcc_address: 'noreply@.com',
      merge: true,
      merge_language: 'mailchimp',
      global_merge_vars: input.variables,
    },
    async: false,
  };
  return payload;
}