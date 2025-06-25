import { CompanyBillingClient } from "@/components/company-billing-client";
import { mockCompanySubscriptions, mockPlans } from "@/lib/mock-data";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscription & Billing',
};

export default function CompanyBillingPage() {
  const companyId = 'sup_1'; // This would be dynamic in a real app
  const subscription = mockCompanySubscriptions.find(s => s.company_id === companyId);
  const plan = subscription ? mockPlans.find(p => p.plan_id === subscription.plan_id) : null;

  if (!subscription || !plan) {
    return (
      <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
        <div className="text-center text-red-500">
          Could not load subscription details.
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
       <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Subscription & Billing
          </h1>
          <p className="text-muted-foreground">
            Manage your plan, review usage, and view your billing history.
          </p>
        </div>
      </header>
      <CompanyBillingClient subscription={subscription} plan={plan} />
    </main>
  );
}
