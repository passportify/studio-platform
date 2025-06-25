import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Building2,
  Handshake,
  ClipboardCheck,
  CheckCircle,
} from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Features Overview',
};

const featureSections = [
  {
    icon: Shield,
    title: "Super Admin Portal",
    description: "The central nervous system for platform governance, configuration, and monitoring.",
    features: [
      "Platform Dashboard: High-level overview of all platform activity, usage analytics, and compliance status.",
      "Entity Registry: Master management of all companies, suppliers, and verifiers on the platform.",
      "Industry & Category Management: Define the core taxonomy that drives product classification and compliance rules.",
      "Schema & Template Engine: Create and manage versioned data schemas for product onboarding using an AI-powered assistant.",
      "Certificate Intelligence Engine: Define granular rules for required compliance documents based on product type and materials.",
      "Trust & Identity Modules: Platform-wide logs for QR codes, blockchain anchors, digital signatures, and decentralized identifiers (DIDs).",
      "Monetization & Access Control: Manage subscription plans, features, and control company-level access to specific platform modules.",
    ],
  },
  {
    icon: Building2,
    title: "Company Portal",
    description: "The primary workspace for brand owners and manufacturers to manage their products and supply chains.",
    features: [
      "Action-Oriented Dashboard: At-a-glance view of product statuses, document compliance, and critical alerts.",
      "My Products Hub: A central list of all company products with direct links to manage documents and traceability.",
      "Product-Specific Document Management: A dynamic checklist of required compliance documents, automatically generated from admin-defined rules.",
      "Interactive Traceability Graph: Visualize and manage the entire upstream Bill of Materials (BOM) for each product.",
      "Supplier Management: Invite and manage the network of suppliers providing materials and data.",
      "AI-Powered Bulk Processing: An intelligent triage center to process documents from file uploads or a unique company email address, with AI-driven product linking.",
      "Self-Service Management: Dedicated pages for managing the company's team, branding, localization, billing, and data privacy consents.",
      "Scoped Trust & Identity Logs: View company-specific logs for QR codes, blockchain anchors, and digital signatures.",
    ],
  },
  {
    icon: Handshake,
    title: "Supplier Portal",
    description: "An efficiency-focused portal for material suppliers to respond to data requests and manage their own compliance.",
    features: [
      "Task-Based Dashboard: Clear overview of open data requests from customers.",
      "Upstream BOM Management: Fulfill data requests by declaring sub-materials and linking to upstream (Tier-N) suppliers.",
      "Reusable Material Library: Proactively define material specifications and link compliance documents once, then reuse them for all customers.",
      "Associated Products Visibility: View a list of final products they supply materials for, providing valuable downstream context (consent-based).",
    ],
  },
  {
    icon: ClipboardCheck,
    title: "Verifier Portal",
    description: "A secure and professional workspace for third-party auditors and verifiers to attest to claims.",
    features: [
      "Verification Queue: A clear, organized list of all documents and claims pending review.",
      "Professional Review Interface: A dedicated screen for each task featuring an embedded document viewer, a clear statement of the claim to be verified, and straightforward action buttons.",
      "Secure Workflow: Enables verifiers to approve or reject submissions with clear, auditable actions.",
    ],
  },
];

export default function FeaturesOverviewPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <header>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Platform Features Overview
        </h1>
        <p className="text-muted-foreground max-w-4xl">
          A comprehensive summary of the features and capabilities developed in Phase 1.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {featureSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <section.icon className="h-10 w-10 text-primary" />
                <div>
                  <CardTitle className="font-headline">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {section.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
