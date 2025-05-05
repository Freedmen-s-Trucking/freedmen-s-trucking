import sgMail, {MailDataRequired} from "@sendgrid/mail";
import {ENV_SEND_GRID_API_KEY} from "~src/utils/envs";

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) => {
  // Set your SendGrid API key
  sgMail.setApiKey(ENV_SEND_GRID_API_KEY);

  // Create email message
  const msg = {
    to,
    from: {
      // from: "noreply@freedmensdispatch.com",
      email: "roland@freedmenstrucking.net",
      name: "Freedmen's Dispatch",
    },
    subject,
    text,
    html,
  } satisfies MailDataRequired;

  return sgMail.send(msg);
};

export const sendWelcomeMail = (email: string, verificationLink: string) =>
  sendEmail({
    to: email,
    subject: "Welcome to Freedmen's - Verify Your Email",
    text: `Welcome to Freedmen's Dispatch.

Click the link below to verify your email and activate your driver account:

${verificationLink}`,
    html: `<p>Welcome to Freedmen's Dispatch.</p>
<p>Click the link below to verify your email and activate your driver account:</p>
<a href="${verificationLink}">Verify Email</a>`,
  });
