
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
import { Inbox, Library, ListPlus } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How-To Guide & FAQ',
};

const steps = [
  {
    icon: Inbox,
    title: "Understanding Your Dashboard",
    content: [
      "Your dashboard shows open data requests from your customers.",
      "Each request specifies the company, the product, and the material data they need from you.",
      "Requests marked 'Action Required' need your immediate attention."
    ]
  },
  {
    icon: ListPlus,
    title: "Fulfilling a Data Request",
    content: [
      "Click 'Fulfill Request' to open a data request.",
      "You will be asked to provide traceability data for the material you supply. This is known as your 'Upstream Bill of Materials'.",
      "You can add sub-materials by linking to your own suppliers or by manually entering the data.",
      "For efficiency, you can add materials from your pre-defined Material Library."
    ]
  },
  {
    icon: Library,
    title: "Managing Your Material Library",
    content: [
      "The 'My Materials' page is your central library of all materials you supply.",
      "By defining a material here once, you can reuse it to fulfill requests from any of your customers on the platform.",
      "This saves you time and ensures your data is consistent across all your business relationships.",
      "You can also upload compliance documents (like a Certificate of Analysis) directly to a material specification."
    ]
  }
];

export default function SupplierHowToPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            How-To Guide & FAQ
          </h1>
          <p className="text-muted-foreground">
            A guide to help you navigate and utilize the Supplier Portal effectively.
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
