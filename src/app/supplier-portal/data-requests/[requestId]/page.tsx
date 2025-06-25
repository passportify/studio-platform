import { SupplierDataRequestClient } from "@/components/supplier-data-request-client";
import { mockDataRequests } from "@/lib/mock-data";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fulfill Data Request',
};

export default function SupplierDataRequestPage({ params }: { params: { requestId: string } }) {
    const dataRequest = mockDataRequests.find(r => r.id === params.requestId);

    if (!dataRequest) {
        return (
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 text-center text-destructive">
                    Data Request not found.
                </div>
            </main>
        )
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <SupplierDataRequestClient dataRequest={dataRequest} />
    </main>
  );
}
