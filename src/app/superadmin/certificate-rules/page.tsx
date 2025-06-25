import { CertificateRuleManagementClient } from '@/components/certificate-rule-management-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certificate Intelligence Engine',
};

export default function CertificateRulesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Certificate Intelligence Engine
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Define, map, and validate all certificate and document requirements based on a product’s industry, category, material, or regulatory status.
      </p>
      <CertificateRuleManagementClient />
    </main>
  );
}
