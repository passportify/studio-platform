
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FilePlus2, FileWarning, Inbox, ShieldAlert, ChevronRight, PieChart, BarChartHorizontal, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { mockCompanyDocStatus, mockCompanySubmissions, mockCompanyProductStatus } from "@/lib/mock-data";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis, Cell } from "recharts";
import React from "react";

const docStatusConfig = {
  "Verified": { label: "Verified", color: "hsl(var(--chart-1))" },
  "Pending": { label: "Pending", color: "hsl(var(--chart-2))" },
  "Rejected": { label: "Rejected", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const submissionConfig = {
  products: {
    label: "Products",
    color: "hsl(var(--chart-1))",
  }
} satisfies ChartConfig;

const productStatusConfig = {
  "Approved": { label: "Approved", color: "hsl(var(--chart-1))" },
  "Draft": { label: "Draft", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;


export default function CompanyDashboardPage() {

  const mockNotifications = [
    {
      type: "warning",
      icon: FileWarning,
      title: "Certificate Expiring Soon",
      description: "The 'UN 38.3 Test Report' for UltraCell EV-B500 will expire in 15 days.",
      link: "/company-portal/my-products/prod_1/documents",
      color: "text-yellow-500", // This will be themed as chart-3 color
    },
    {
      type: "info",
      icon: Inbox,
      title: "New Document Received",
      description: "Congo Minerals S.A. has submitted the 'Certificate of Origin' for Cobalt.",
      link: "/company-portal/my-products/prod_1/documents",
      color: "text-primary",
    },
    {
      type: "critical",
      icon: ShieldAlert,
      title: "New Compliance Requirement",
      description: "A new substance has been added to the REACH SVHC list. Review products for impact.",
      link: "/company-portal/my-products",
      color: "text-destructive",
    },
     {
      type: "action",
      icon: FilePlus2,
      title: "Create New Product",
      description: "Onboard a new product and start building its Digital Product Passport.",
      link: "/company-portal/my-products/new",
      color: "text-primary",
    },
  ];

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Company Dashboard
          </h1>
          <p className="text-muted-foreground">
            Good to see you, Alice. Welcome to the UltraCell GmbH portal.
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
         <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <CheckCircle className="text-primary"/>
              Product Status
            </CardTitle>
            <CardDescription>Overview of your current product portfolio.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={productStatusConfig} className="h-40 w-full">
              <RechartsBarChart accessibilityLayer data={mockCompanyProductStatus} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={80}
                />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" layout="vertical" radius={5}>
                    {mockCompanyProductStatus.map((entry) => (
                        <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
                    ))}
                   <LabelList dataKey="value" position="right" offset={8} className="fill-foreground text-xs" />
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <BarChartHorizontal className="text-primary"/>
              Document Compliance
            </CardTitle>
            <CardDescription>Status of all compliance documents uploaded by your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={docStatusConfig} className="h-40 w-full">
                <RechartsBarChart accessibilityLayer data={mockCompanyDocStatus} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={80}
                />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" layout="vertical" radius={5}>
                    {mockCompanyDocStatus.map((entry) => (
                        <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
                    ))}
                   <LabelList dataKey="value" position="right" offset={8} className="fill-foreground text-xs" />
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <BarChartHorizontal className="text-primary"/>
              Monthly Submissions
            </CardTitle>
            <CardDescription>Number of new products created each month.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={submissionConfig} className="h-52 w-full">
              <RechartsBarChart accessibilityLayer data={mockCompanySubmissions} layout="vertical">
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="month"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <XAxis dataKey="products" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="products"
                  fill="var(--color-products)"
                  radius={5}
                  layout="vertical"
                >
                    <LabelList dataKey="products" position="right" offset={8} className="fill-foreground text-xs" />
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Action Center</CardTitle>
            <CardDescription>Key tasks and alerts that require your attention.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockNotifications.map((item, index) => (
            <Link key={index} href={item.link} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-accent transition-colors">
              <item.icon className={`h-6 w-6 ${item.color}`} />
              <div className="flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
       </Card>
    </main>
  );
}
