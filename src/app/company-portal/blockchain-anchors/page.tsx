import { CompanyBlockchainAnchorClient } from '@/components/company-blockchain-anchor-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blockchain Anchor Log',
};

export default function CompanyBlockchainAnchorsPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Blockchain Anchor Log
          </h1>
          <p className="text-muted-foreground">
            An immutable, tamper-proof record of all data hashes for your products anchored on the blockchain.
          </p>
        </div>
      </header>
      <CompanyBlockchainAnchorClient />
    </main>
  );
}
