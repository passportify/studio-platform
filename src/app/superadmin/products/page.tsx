import { ProductRegistryClient } from '@/components/product-registry-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Product Registry',
};

export default function ProductsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Global Product Registry
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        A consolidated, read-only view of all products created by all companies on the platform. Use this for global oversight and monitoring.
      </p>
      <ProductRegistryClient />
    </main>
  );
}
