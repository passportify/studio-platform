import { BlockchainAnchorClient } from '@/components/blockchain-anchor-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blockchain Anchor Log',
};

export default function BlockchainAnchorsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Blockchain Anchor Log
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        An immutable, tamper-proof record of all anchored data hashes, providing verifiable proof of integrity for critical records like DPP versions, certificates, and attestations.
      </p>
      <BlockchainAnchorClient />
    </main>
  );
}
