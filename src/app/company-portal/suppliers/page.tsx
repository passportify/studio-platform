import { CompanySuppliersClient } from "@/components/company-suppliers-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Supplier Management',
};

export default function CompanySuppliersPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Supplier Management
          </h1>
          <p className="text-muted-foreground">
            Invite and manage the suppliers in your value chain.
          </p>
        </div>
      </header>
      <CompanySuppliersClient />
    </main>
  );
}
