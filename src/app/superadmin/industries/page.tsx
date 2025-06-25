import { IndustryManagementClient } from '@/components/industry-management-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industry Management',
};

export default function IndustriesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Industry Management
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Manage the master list of industries aligned to the EU DPP taxonomy. This configuration drives downstream compliance rules and product classification.
      </p>
      <IndustryManagementClient />
    </main>
  );
}
