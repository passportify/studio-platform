import { AuditTrailClient } from '@/components/audit-trail-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event & Change Logs',
};

export default function AuditTrailPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Event & Change Logs
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        A complete, tamper-proof record of all product data modifications and major lifecycle events, including submissions, validations, approvals, and QR scans.
      </p>
      <AuditTrailClient />
    </main>
  );
}
