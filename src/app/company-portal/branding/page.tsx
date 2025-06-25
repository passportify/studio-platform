import { CompanyBrandingClient } from "@/components/company-branding-client";
import { mockCompanyBranding } from "@/lib/mock-data";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Branding & Appearance',
};

export default function CompanyBrandingPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Branding & Appearance
          </h1>
          <p className="text-muted-foreground">
            Customize the look and feel of your public-facing pages and portals.
          </p>
        </div>
      </header>
      <CompanyBrandingClient initialData={mockCompanyBranding} />
    </main>
  );
}
