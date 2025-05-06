import sgMail, {MailDataRequired} from "@sendgrid/mail";
import {ENV_PUBLIC_WEBAPP_URL, ENV_SEND_GRID_API_KEY} from "~src/utils/envs";

/**
 * Sends an email to the specified email address.
 * @param to - The email address to send the email to.
 * @param subject - The subject of the email.
 * @param text - The text content of the email.
 * @param html - The HTML content of the email.
 */
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

/**
 * Sends a welcome email to the specified email address.
 * @param email - The email address to send the email to.
 * @param verificationLink - The verification link to include in the email.
 */
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

/**
 * Sends a document verification email to the specified email address.
 * @param email - The email address to send the email to.
 * @param title - The title of the email.
 * @param message - The message to send in the email.
 */
export const sendDocumentVerificationMail = ({
  email,
  status,
  documentType,
  expirationDate,
  title,
  message,
  driverName,
}: {
  email: string;
  status: "verified" | "failed";
  title: string;
  message: string;
  driverName: string;
  documentType: "driver license" | "proof of insurance";
  expirationDate: string;
}) => {
  const textActionTemplate =
    status === "verified"
      ? APPROVED_DOCUMENT_VERIFICATION_TEXT_TEMPLATE
      : ACTION_REQUIRED_DOCUMENT_VERIFICATION_TEXT_TEMPLATE;
  const emailActionTemplate =
    status === "verified"
      ? APPROVED_DOCUMENT_VERIFICATION_MAIL_TEMPLATE
      : ACTION_REQUIRED_DOCUMENT_VERIFICATION_MAIL_TEMPLATE;

  return sendEmail({
    to: email,
    subject: title,
    text: DOCUMENT_VERIFICATION_TEXT_TEMPLATE.replace("{ACTION_TEMPLATE}", textActionTemplate)
      .replaceAll("{DRIVER_NAME}", driverName)
      .replaceAll("{DOCUMENT_TYPE}", documentType)
      .replaceAll("{EXPIRATION_DATE}", expirationDate)
      .replaceAll("{MESSAGE}", message)
      .replaceAll("{DASHBOARD_LINK}", ENV_PUBLIC_WEBAPP_URL),
    html: DOCUMENT_VERIFICATION_EMAIL_TEMPLATE.replace("{ACTION_TEMPLATE}", emailActionTemplate)
      .replaceAll("{DRIVER_NAME}", driverName)
      .replaceAll("{DOCUMENT_TYPE}", documentType)
      .replaceAll("{EXPIRATION_DATE}", expirationDate)
      .replaceAll("{MESSAGE}", message)
      .replaceAll("{DASHBOARD_LINK}", ENV_PUBLIC_WEBAPP_URL),
  });
};

const DOCUMENT_VERIFICATION_TEXT_TEMPLATE = `
---FREEDMEN DELIVERY---
VERIFICATION STATUS UPDATE

Hello {DRIVER_NAME},

Thank you for choosing Freedmen as your delivery platform. We're writing to inform you about the status of your document verification:

{ACTION_TEMPLATE}

Best regards,
The Freedmen's Trucking Team

---

© ${new Date().getFullYear()} Freedmen's Trucking. All rights reserved.
`;
// 123 Delivery Street, City, State 12345
//
// Privacy Policy: {PRIVACY_POLICY}
// Terms of Service: {TERMS_OF_SERVICE}
//
// This email was sent to {EMAIL_ADDRESS}.
// If you no longer wish to receive these updates, you can unsubscribe here: {UNSUBSCRIBE_LINK}
// `;

// const PENDING_DOCUMENT_VERIFICATION_TEXT_TEMPLATE = `
// === PENDING VERIFICATION ===
// We've received your {DOCUMENT_TYPE} and our team is currently reviewing it. This process typically takes 1-2 business days.
// Verification details:

// Document Type: {DOCUMENT_TYPE}
// Submission Date: {SUBMISSION_DATE}
// Estimated Completion: {ESTIMATED_COMPLETION}

// You will receive another email once the verification process is complete.
// Check status: {DASHBOARD_LINK}
// `;

const ACTION_REQUIRED_DOCUMENT_VERIFICATION_TEXT_TEMPLATE = `
=== ACTION REQUIRED ===
Unfortunately, we couldn't verify your {DOCUMENT_TYPE} due to the following reason(s):
- {MESSAGE}

Please update your information and resubmit your documentation as soon as possible to continue with the onboarding process.

Resubmit documents: {RESUBMIT_LINK}
If you have any questions or need assistance, please contact our support team at support@freedmen.com or call us at (555) 123-4567.
`;

const APPROVED_DOCUMENT_VERIFICATION_TEXT_TEMPLATE = `
=== APPROVED ===
Your {DOCUMENT_TYPE} has been successfully verified. You are now ready to start delivering with Freedmen!

Verification details:
- Document Type: {DOCUMENT_TYPE}
- Verification Date: ${new Date().toLocaleDateString()}
- Valid Until: {EXPIRATION_DATE}

We'll send you a reminder when it's time to renew your documentation.

Visit your dashboard: {DASHBOARD_LINK}
`;

const DOCUMENT_VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Freedmen Delivery - Verification Status</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #382114;
            padding: 20px;
            text-align: center;
        }
        .logo {
            max-width: 150px;
        }
        .content {
            padding: 20px;
            background-color: #FFFCFA;
        }
        .footer {
            background-color: #FFFCFA;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666666;
        }
        .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
        }
        .status {
            font-weight: bold;
            font-size: 18px;
            margin: 15px 0;
        }
        .approved {
            color: #4CAF50;
        }
        .pending {
            color: #FFA500;
        }
        .rejected {
            color: #FF0000;
        }
        .info-box {
            background-color: #F2E7D8;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${ENV_PUBLIC_WEBAPP_URL}/favicon.ico" alt="Freedmen's Trucking Logo" class="logo">
      <h1 style="color: #ffffff;">Freedmen's Trucking</h1>
    </div>
    
    <div class="content">
      <h2>Verification Status Update</h2>
        
      <p>Hello {DRIVER_NAME},</p>
        
      <p>Thank you for choosing Freedmen's Trucking. We're writing to inform you about the status of your document verification:</p>
      {ACTION_TEMPLATE} 
        
      <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:support@freedmen.com">support@freedmen.com</a> or call us at (555) 123-4567.</p>
        
      <p>Best regards,<br>
        The Freedmen's Trucking Team</p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Freedmen Delivery. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// const PENDING_DOCUMENT_VERIFICATION_MAIL_TEMPLATE = `
// <!-- For Pending Status -->
// <div class="info-box">
//   <p class="status pending">⏱ PENDING VERIFICATION</p>
//   <p>We've received your {DOCUMENT_TYPE} and our team is currently reviewing it. This process typically takes 1-2 business days.</p>
//   <p>Verification details:</p>
//   <ul>
//     <li><strong>Document Type:</strong> {DOCUMENT_TYPE}</li>
//     <li><strong>Submission Date:</strong> {SUBMISSION_DATE}</li>
//     <li><strong>Estimated Completion:</strong> {ESTIMATED_COMPLETION}</li>
//   </ul>
//   <p>You will receive another email once the verification process is complete.</p>
//   <a href="{DASHBOARD_LINK}" class="button">CHECK STATUS</a>
// </div>
// `;

const APPROVED_DOCUMENT_VERIFICATION_MAIL_TEMPLATE = `
<!-- For Approved Status -->
<div class="info-box">
  <p class="status approved">✓ APPROVED</p>
  <p>Your {DOCUMENT_TYPE} has been successfully verified. You are now ready to start delivering with Freedmen!</p>
  <p>Verification details:</p>
  <ul>
    <li><strong>Document Type:</strong> {DOCUMENT_TYPE}</li>
    <li><strong>Verification Date:</strong> {VERIFICATION_DATE}</li>
    <li><strong>Valid Until:</strong> {VALID_UNTIL_DATE}</li>
  </ul>
  <p>We'll send you a reminder when it's time to renew your documentation.</p>
  <a href="{DASHBOARD_LINK}" class="button">GO TO DASHBOARD</a>
</div>
`;

const ACTION_REQUIRED_DOCUMENT_VERIFICATION_MAIL_TEMPLATE = `
<!-- For Rejected Status -->
<div class="info-box">
  <p class="status rejected">✗ ACTION REQUIRED</p>
  <p>Unfortunately, we couldn't verify your {DOCUMENT_TYPE} due to the following reason(s):</p>
  <ul>
    <li>{MESSAGE}</li>
  </ul>
  <p>Please update your information and resubmit your documentation as soon as possible to continue with the onboarding process.</p>
  <a href="{DASHBOARD_LINK}" class="button">GO TO DASHBOARD TO RESUBMIT DOCUMENTS</a>
</div>
`;
