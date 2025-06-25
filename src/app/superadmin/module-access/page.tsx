import { ModuleAccessManagementClient } from '@/components/module-access-management-client';
import { mockSuppliers, mockModules, mockCompanyModuleAccess, mockPlans, mockCompanySubscriptions } from '@/lib/mock-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Module Access Control',
};

export default function ModuleAccessPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Module Access Control
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Enable or disable specific platform modules for each company based on their subscription plan. This configuration controls feature availability and access rights across the platform.
      </p>
      <ModuleAccessManagementClient 
        companies={mockSuppliers}
        modules={mockModules}
        plans={mockPlans}
        subscriptions={mockCompanySubscriptions}
        initialAccessRecords={mockCompanyModuleAccess}
      />
    </main>
  );
}
