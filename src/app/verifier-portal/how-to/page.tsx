
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { List, FileSearch, CheckCircle, XCircle } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How-To Guide & FAQ',
};

const steps = [
  {
    icon: List,
    title: "Navigating the Verification Queue",
    content: [
      "Your dashboard provides a summary of all tasks.",
      "The 'Verification Queue' page lists all documents and claims pending your review and attestation.",
      "Each item in the queue represents a document submitted by a company for your expert verification."
    ]
  },
  {
    icon: FileSearch,
    title: "Reviewing a Task",
    content: [
      "Click 'Review' on any task in the queue to open the verification screen.",
      "You will see the document itself in a viewer, along with metadata about who submitted it and for which product.",
      "Carefully review the document content against the claim being made."
    ]
  },
  {
    icon: CheckCircle,
    title: "Approving a Submission",
    content: [
      "If the document is valid and supports the claim, click the 'Approve' button.",
      "This action will mark the document as 'Verified' in the system.",
      "Your approval may be cryptographically signed and recorded on the audit trail, adding a layer of trust to the DPP."
    ]
  },
   {
    icon: XCircle,
    title: "Rejecting a Submission",
    content: [
      "If the document is invalid, expired, or does not support the claim, click the 'Reject' button.",
      "You will be prompted to provide a clear and concise reason for the rejection.",
      "This feedback is crucial as it will be sent back to the submitting company so they can correct the issue."
    ]
  }
];

export default function VerifierHowToPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            How-To Guide & FAQ
          </h1>
          <p className="text-muted-foreground">
            A guide to help you navigate and utilize the Verifier Portal effectively.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {steps.map((step, index) => (
              <AccordionItem value={`item-${index + 1}`} key={index}>
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <step.icon className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{step.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                    {step.content.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </main>
  );
}
