import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from 'next/link';
import { Shield, Building2, Handshake, ClipboardCheck } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Passportify - The All-in-One Platform for Digital Product Passports',
};

export default function HomePage() {
  const portals = [
    {
      href: "/company-portal",
      icon: Building2,
      title: "Company Portal",
      description: "Manage products, create DPPs, and engage with your supply chain."
    },
    {
      href: "/supplier-portal",
      icon: Handshake,
      title: "Supplier Portal",
      description: "Fulfill data requests and manage your reusable material library."
    },
    {
      href: "/verifier-portal",
      icon: ClipboardCheck,
      title: "Verifier Portal",
      description: "Review and attest to compliance claims and submitted documents."
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-svh bg-background p-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold tracking-tight">
          Welcome to Passportify
        </h1>
        <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
          The simplified, all-in-one platform for creating and managing Digital Product Passports. Select your portal to get started.
        </p>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full">
          {portals.map((portal) => (
            <Link key={portal.href} href={portal.href} passHref>
              <Card className="hover:border-primary/50 hover:shadow-xl transition-all duration-300 h-full flex flex-col group cursor-pointer">
                <CardHeader>
                  <div className="p-4 bg-primary/10 rounded-lg self-start group-hover:scale-110 group-hover:bg-primary/20 transition-transform duration-300">
                    <portal.icon className="w-8 h-8 text-primary"/>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardTitle className="font-headline text-xl mb-2">{portal.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{portal.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
