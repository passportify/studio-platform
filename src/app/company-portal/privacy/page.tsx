import { CompanyPrivacyClient } from "@/components/company-privacy-client";
import { mockCompanySuppliers, mockPrivacyConsents } from "@/lib/mock-data";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy & Consent Management',
};

export default function CompanyPrivacyPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Privacy & Consent Management
          </h1>
          <p className="text-muted-foreground">
            Control what data your suppliers and partners can access.
          </p>
        </div>
      </header>
      <CompanyPrivacyClient 
        suppliers={mockCompanySuppliers} 
        initialConsents={mockPrivacyConsents} 
      />
    </main>
  );
}
