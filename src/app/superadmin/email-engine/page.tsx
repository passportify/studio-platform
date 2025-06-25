import { EmailEngineClient } from '@/components/email-engine-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Engine Management',
};

export default function EmailEnginePage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Email Engine Management
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Configure automated email notifications for key platform events. Manage triggers and edit email templates using the AI-powered editor.
      </p>
      <EmailEngineClient />
    </main>
  );
}
