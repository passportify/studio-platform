import { CompanyQrCodeClient } from '@/components/company-qr-code-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Code Log',
};

export default function CompanyQrCodesPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            QR Code Log
          </h1>
          <p className="text-muted-foreground">
            A log of all QR codes generated for your products.
          </p>
        </div>
      </header>
      <CompanyQrCodeClient />
    </main>
  );
}
