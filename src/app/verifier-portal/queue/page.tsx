import { VerifierQueueClient } from '@/components/verifier-queue-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verification Queue',
};

export default function VerifierQueuePage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Verification Queue
          </h1>
          <p className="text-muted-foreground">
            All documents and claims pending your review and attestation.
          </p>
        </div>
      </header>
      <VerifierQueueClient />
    </main>
  );
}
