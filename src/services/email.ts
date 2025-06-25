
import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey) {
    throw new Error('Email sending is disabled. SENDGRID_API_KEY is not configured. Please check your .env file and restart the server.');
  }
  if (!fromEmail) {
    throw new Error('Email sending is disabled. SENDGRID_FROM_EMAIL is not configured. Please check your .env file and restart the server.');
  }

  sgMail.setApiKey(apiKey);

  const msg = {
    to,
    from: fromEmail,
    subject,
    html,
  };

  try {
    const response = await sgMail.send(msg);
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.body?.errors?.[0]?.message || 'An error occurred with the SendGrid API.';
      throw new Error(`SendGrid Error: ${errorMessage}`);
    }
    throw new Error('Failed to send email. Check server logs for details.');
  }
}
