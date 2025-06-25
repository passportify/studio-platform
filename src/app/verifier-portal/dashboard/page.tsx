import { VerifierDashboardClient } from '@/components/verifier-dashboard-client';
import { mockVerificationTasks } from '@/lib/mock-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verifier Dashboard',
};

export default function VerifierDashboardPage() {
    const stats = {
        pending: mockVerificationTasks.filter(t => t.status === 'Pending').length,
        inReview: mockVerificationTasks.filter(t => t.status === 'In Review').length,
        approved: mockVerificationTasks.filter(t => t.status === 'Approved').length,
        rejected: mockVerificationTasks.filter(t => t.status === 'Rejected').length,
    }

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Verifier Dashboard
          </h1>
          <p className="text-muted-foreground">
            Good to see you, David. Here is a summary of your verification tasks for SGS Global Services.
          </p>
        </div>
      </header>
      <VerifierDashboardClient stats={stats} />
    </main>
  );
}
