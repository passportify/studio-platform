import { TraceabilityEngineClient } from '@/components/traceability-engine-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Traceability & Material Linkage Engine',
};

export default function TraceabilityPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Traceability & Material Linkage Engine
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Map all materials used in a product, their origins, and their supplier relationships to enable end-to-end traceability from Tier 1 to Tier N.
      </p>
      <TraceabilityEngineClient />
    </main>
  );
}
