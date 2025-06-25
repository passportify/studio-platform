import { ProductCategoryManagementClient } from '@/components/product-category-management-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Category Management',
};

export default function ProductCategoriesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Product Category Management
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Manage the granular classification of product types within each industry. This configuration drives form templates and compliance logic.
      </p>
      <ProductCategoryManagementClient />
    </main>
  );
}
