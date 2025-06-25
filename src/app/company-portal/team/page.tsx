import { CompanyTeamManagementClient } from "@/components/company-team-management-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team Management',
};

export default function CompanyTeamPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Team Management
          </h1>
          <p className="text-muted-foreground">
            Invite and manage team members and their permissions within your organization.
          </p>
        </div>
      </header>
      <CompanyTeamManagementClient />
    </main>
  );
}
