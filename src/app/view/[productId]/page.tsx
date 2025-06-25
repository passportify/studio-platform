import { PublicDppViewer } from "@/components/public-dpp-viewer";
import { mockDppData } from "@/lib/mock-data";
import type { Metadata } from 'next';

type Props = {
  params: { productId: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = mockDppData[params.productId] || null;
  const productName = data ? data.productName : "Digital Product Passport";

  return {
    title: productName,
  };
}

export default function PublicDppPage({ params }: { params: { productId: string } }) {
  const data = mockDppData[params.productId] || null;

  if (!data) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground">The DPP for the specified product could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <PublicDppViewer data={data} />
    </div>
  );
}
