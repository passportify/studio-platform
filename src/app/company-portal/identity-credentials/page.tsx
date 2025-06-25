import { CompanyIdentityCredentialClient } from '@/components/company-identity-credential-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Digital Identity',
};

export default function CompanyIdentityCredentialsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Your Digital Identity
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Manage your organization's Decentralized Identifiers (DIDs) and any Verifiable Credentials (VCs) you have issued or received.
      </p>
      <CompanyIdentityCredentialClient />
    </main>
  );
}
