import { CompanyProductTraceabilityClient } from "@/components/company-product-traceability-client";
import { mockCompanyProducts } from "@/lib/mock-data";
import type { Metadata } from 'next';

type Props = {
  params: { productId: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = mockCompanyProducts.find(p => p.id === params.productId);
  const productName = product ? product.name : "Product";

  return {
    title: `Traceability for ${productName}`,
  };
}

export default function CompanyProductTraceabilityPage({ params }: { params: { productId: string }}) {
    const product = mockCompanyProducts.find(p => p.id === params.productId);

    if (!product) {
        return (
            <div className="text-center text-red-500">
                Product not found.
            </div>
        )
    }

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
       <header className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Traceability for: {product.name}
          </h1>
          <p className="text-muted-foreground">
            Manage the Bill of Materials and supplier linkages for this product.
          </p>
        </div>
      </header>
      <CompanyProductTraceabilityClient productId={product.id} />
    </main>
  );
}
