import { PlanManagementClient } from '@/components/plan-management-client';
import { mockPlans, mockCompanySubscriptions, mockSuppliers } from '@/lib/mock-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscription & Plan Management',
};

export default function PlansPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Subscription & Plan Management
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Define pricing tiers, manage features, and view company subscriptions to control platform monetization and feature entitlements.
      </p>
      <PlanManagementClient
        initialPlans={mockPlans}
        initialSubscriptions={mockCompanySubscriptions}
        companies={mockSuppliers}
      />
    </main>
  );
}
