

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
import { ListOrdered, Upload, Share2, Mail, Users, Palette, FileScan } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How-To Guide & FAQ',
};

const steps = [
  {
    icon: ListOrdered,
    title: "Onboarding Your First Product",
    content: [
      "Navigate to 'My Products' and click 'Add New Product'.",
      "Select the correct Industry and Product Category. This determines the required data fields.",
      "Fill in all the required metadata for your product based on the form presented.",
      "Use the 'Check Compliance' feature to get AI-driven feedback on your data before saving.",
      "Once you are satisfied, save the product as a draft. It will now appear in your 'My Products' list."
    ]
  },
  {
    icon: Upload,
    title: "Managing Compliance Documents",
    content: [
      "From the 'My Products' list, go to 'Manage Documents' for a specific product.",
      "You will see a checklist of required documents based on its category.",
      "Click 'Upload' next to a missing document to provide the necessary file.",
      "Once uploaded, the document status will be 'Pending'. You can then request verification from an approved third-party."
    ]
  },
  {
    icon: FileScan,
    title: "Using AI Document Intelligence",
    content: [
      "Navigate to the 'Bulk Processing' page from the sidebar.",
      "Upload a compliance document, such as a test report or certificate of conformity.",
      "The AI will process the document and extract key data points into a review form.",
      "Verify the extracted data, make any necessary corrections, and then approve it to save the information."
    ]
  },
  {
    icon: Share2,
    title: "Building Your Supply Chain",
    content: [
      "Go to the 'Manage Traceability' page for a product.",
      "Here you can add materials and components to build your Bill of Materials (BOM).",
      "For each material, you must link a supplier from your network.",
      "If a supplier is not yet in your network, you can invite them directly from this screen."
    ]
  },
    {
    icon: Mail,
    title: "Running Supplier Campaigns",
    content: [
      "Use the 'Campaign Manager' to create email campaigns to request data from your suppliers in bulk.",
      "Define a clear objective, and our AI assistant can help you draft a professional email.",
      "Select a target audience (e.g., all suppliers missing a specific certificate) and send the campaign.",
      "Suppliers will receive a notification and a link to fulfill your request in their portal."
    ]
  },
  {
    icon: Users,
    title: "Managing Your Team & Suppliers",
    content: [
      "Use the 'Team' page to invite colleagues to your portal and assign them roles (Admin, Editor, etc.).",
      "Use the 'Suppliers' page to manage all suppliers in your network, view their status, and invite new ones."
    ]
  },
  {
    icon: Palette,
    title: "Customizing Your Brand",
    content: [
      "The 'Branding' page allows you to customize the appearance of your public-facing DPP pages.",
      "Upload your company logo and set your brand colors for a consistent look and feel."
    ]
  }
];

export default function CompanyHowToPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            How-To Guide & FAQ
          </h1>
          <p className="text-muted-foreground">
            A guide to help you navigate and utilize the Company Portal effectively.
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
