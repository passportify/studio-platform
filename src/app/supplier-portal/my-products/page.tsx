import { SupplierMyProductsClient } from '@/components/supplier-my-products-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Associated Products',
};

export default function SupplierMyProductsPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
       <header className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Associated Products
          </h1>
          <p className="text-muted-foreground">
            A list of products you supply materials for.
          </p>
        </div>
      </header>
      <SupplierMyProductsClient />
    </main>
  );
}
