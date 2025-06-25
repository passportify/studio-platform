import { CompanyDocumentAiClient } from "@/components/company-document-ai-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Document Intelligence',
};

export default function CompanyDocumentAiPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            AI Document Intelligence
          </h1>
          <p className="text-muted-foreground">
            Automate data entry by uploading compliance documents. The AI will extract the data for your review.
          </p>
        </div>
      </header>
      <CompanyDocumentAiClient />
    </main>
  );
}
