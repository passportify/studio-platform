import { CompanyCampaignManagerClient } from "@/components/company-campaign-manager-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campaign Manager',
};

export default function CompanyCampaignsPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Campaign Manager
          </h1>
          <p className="text-muted-foreground">
            Create and manage email campaigns to collect data from your suppliers.
          </p>
        </div>
      </header>
      <CompanyCampaignManagerClient />
    </main>
  );
}
