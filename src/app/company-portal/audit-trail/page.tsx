import { CompanyAuditTrailClient } from "@/components/company-audit-trail-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Audit Trail',
};

export default function CompanyAuditTrailPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Company Audit Trail
          </h1>
          <p className="text-muted-foreground">
            A complete, tamper-proof record of all actions taken by your organization.
          </p>
        </div>
      </header>
      <CompanyAuditTrailClient />
    </main>
  );
}
