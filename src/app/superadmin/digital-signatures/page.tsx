import { DigitalSignatureManagementClient } from '@/components/digital-signature-management-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Signature Engine',
};

export default function DigitalSignaturesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Digital Signature Engine
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Oversee and manage all cryptographic signatures applied to DPPs, certificates, and other critical records, ensuring the integrity and authenticity of platform data.
      </p>
      <DigitalSignatureManagementClient />
    </main>
  );
}
