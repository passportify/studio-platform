
'use server';

import * as z from 'zod';
import { sendEmail } from '@/services/email';

const testEmailSchema = z.object({
  email: z.string().email(),
});

export async function sendTestEmailAction(
  input: z.infer<typeof testEmailSchema>
): Promise<{ success: boolean; error?: string }> {
  const validation = testEmailSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: 'Invalid email address.' };
  }

  try {
    await sendEmail({
      to: validation.data.email,
      subject: 'Test Email from Passportify',
      html: '<h1>Success!</h1><p>This is a test email from your Passportify Email Engine configuration.</p>',
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
