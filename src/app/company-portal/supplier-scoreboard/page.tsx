
import { SupplierScoreboardClient } from '@/components/supplier-scoreboard-client';
import { mockSuppliers, mockSupplierScores } from '@/lib/mock-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Supplier Reputation Scoreboard',
};

export default function CompanySupplierScoreboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Supplier Reputation Scoreboard
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        A transparent overview of your suppliers' performance based on compliance, responsiveness, and data quality. Use this board to identify your top-performing partners.
      </p>
      <SupplierScoreboardClient suppliers={mockSuppliers} scores={mockSupplierScores} />
    </main>
  );
}
