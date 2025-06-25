import { CompanyMyProductsClient } from '@/components/company-my-products-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Products',
};

export default function CompanyMyProductsPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
       <header className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            My Products
          </h1>
          <p className="text-muted-foreground">
            Manage all your product submissions and their DPP status.
          </p>
        </div>
      </header>
      <CompanyMyProductsClient />
    </main>
  );
}
