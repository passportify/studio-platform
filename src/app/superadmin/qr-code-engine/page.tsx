import { QRCodeEngineClient } from '@/components/qr-code-engine-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Code Engine',
};

export default function QRCodeEnginePage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          QR Code Engine
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Generate, manage, and view QR codes that link physical products to their Digital Product Passports.
      </p>
      <QRCodeEngineClient />
    </main>
  );
}
