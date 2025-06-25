import { CompanyProductDocumentsClient } from "@/components/company-product-documents-client";
import { mockCompanyProducts } from "@/lib/mock-data";
import type { Metadata } from 'next';

type Props = {
  params: { productId: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = mockCompanyProducts.find(p => p.id === params.productId);
  const productName = product ? product.name : "Product";

  return {
    title: `Compliance Documents for ${productName}`,
  };
}

export default function CompanyProductDocumentsPage({ params }: { params: { productId: string }}) {
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
            Compliance Documents for: {product.name}
          </h1>
          <p className="text-muted-foreground">
            Manage all certificates and compliance files for this product.
          </p>
        </div>
      </header>
      <CompanyProductDocumentsClient productId={product.id} />
    </main>
  );
}
