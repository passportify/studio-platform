import { CompanyDigitalSignatureClient } from '@/components/company-digital-signature-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Signature Log',
};

export default function CompanyDigitalSignaturesPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Digital Signature Log
          </h1>
          <p className="text-muted-foreground">
            A verifiable record of all cryptographic signatures created by your organization.
          </p>
        </div>
      </header>
      <CompanyDigitalSignatureClient />
    </main>
  );
}
