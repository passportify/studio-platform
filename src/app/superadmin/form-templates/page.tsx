import { FormTemplateManagementClient } from '@/components/form-template-management-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Schema & Template Engine',
};

export default function FormTemplatesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Schema & Template Engine
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Manage the versioned schemas and form structures used for product onboarding. Schemas are linked to industries and product categories to ensure relevant data collection.
      </p>
      <FormTemplateManagementClient />
    </main>
  );
}
