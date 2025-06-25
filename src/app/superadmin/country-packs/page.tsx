import { CountryPackManagementClient } from '@/components/country-pack-management-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Language & Country Packs',
};

export default function CountryPacksPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Language & Country Pack Support
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Manage multilingual accessibility and regional compliance configurations. Add and edit language packs, translation dictionaries, and country-specific rules.
      </p>
      <CountryPackManagementClient />
    </main>
  );
}
