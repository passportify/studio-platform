import { IdentityCredentialManagementClient } from '@/components/identity-credential-management-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Identity & Credentials',
};

export default function IdentityCredentialsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Identity & Credentials
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Manage the system of trust based on Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs).
      </p>
      <IdentityCredentialManagementClient />
    </main>
  );
}
