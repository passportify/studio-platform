'use server';
/**
 * @fileOverview An AI flow for sending a one-time password (OTP) for 2FA.
 */

import { ai } from '@/ai/genkit';
import { sendEmail } from '@/services/email';
import { z } from 'genkit';

const SendOtpInputSchema = z.object({
  email: z.string().email(),
});
export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

const SendOtpOutputSchema = z.object({
  success: z.boolean(),
  // NOTE: In a real app, you would NOT return the OTP. This is for simulation.
  otp: z.string(), 
});
export type SendOtpOutput = z.infer<typeof SendOtpOutputSchema>;

export async function sendOtp(input: SendOtpInput): Promise<SendOtpOutput> {
  return sendOtpFlow(input);
}

const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    inputSchema: SendOtpInputSchema,
    outputSchema: SendOtpOutputSchema,
  },
  async ({ email }) => {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real application, you would:
    // 1. Hash the OTP.
    // 2. Store the hashed OTP and its expiry time in your database, associated with the user's email.
    // 3. For this prototype, we'll just log it.
    console.log(`Generated OTP for ${email}: ${otp}`);

    const subject = 'Your Passportify Verification Code';
    const html = `
      <h1>Your Passportify Verification Code</h1>
      <p>Your one-time password is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({ to: email, subject, html });
      return { success: true, otp };
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      // In a real app, you would want more robust error handling here.
      return { success: false, otp: '' }; 
    }
  }
);
