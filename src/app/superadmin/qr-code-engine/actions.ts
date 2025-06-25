
'use server';

import * as z from 'zod';
import QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import type { QRCodeLog } from '@/lib/types';

const generateQRCodeInputSchema = z.object({
  productId: z.string(),
  versionId: z.string(),
});

type GenerateQRCodeInput = z.infer<typeof generateQRCodeInputSchema>;

export async function generateQRCodeAction(
  input: GenerateQRCodeInput
): Promise<{ success: boolean; data?: QRCodeLog; error?: string }> {
  const validation = generateQRCodeInputSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { productId, versionId } = validation.data;
  const qrCodeValue = `https://passportify.online/view/${productId}?v=${versionId}`;

  try {
    const rendered_image_base64 = await await QRCode.toDataURL(qrCodeValue);

    const qrCodeLog: QRCodeLog = {
      qr_code_id: `qr_${randomUUID()}`,
      product_id: productId,
      version_id: versionId,
      qr_code_value: qrCodeValue,
      hash_signature: `sha256_${randomUUID().replace(/-/g, '')}`, // Mock hash
      rendered_image_base64,
      last_updated_at: new Date().toISOString(),
      generated_by: 'system',
      status: 'Active',
      redirect_mode: 'Direct Link',
    };

    return { success: true, data: qrCodeLog };
  } catch (err) {
    console.error('QR Code generation failed:', err);
    return { success: false, error: 'Failed to generate QR code image.' };
  }
}
