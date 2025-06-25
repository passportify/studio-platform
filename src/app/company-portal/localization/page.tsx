import { CompanyLocalizationClient } from "@/components/company-localization-client";
import { mockCompanyLocalizationSettings } from "@/lib/mock-data";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Localization Settings',
};

export default function CompanyLocalizationPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Localization Settings
          </h1>
          <p className="text-muted-foreground">
            Manage language, locale, and unit preferences for your organization.
          </p>
        </div>
      </header>
      <CompanyLocalizationClient initialData={mockCompanyLocalizationSettings} />
    </main>
  );
}
