import { EntityRegistryClient } from '@/components/entity-registry-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Entity Registry',
};

export default function EntityRegistryPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Entity Registry
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Manage the master registry of all entities on the platform, including manufacturers, brand owners, suppliers, and verifiers.
      </p>
      <EntityRegistryClient />
    </main>
  );
}
