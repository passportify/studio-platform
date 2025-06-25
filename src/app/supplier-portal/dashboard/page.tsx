
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileCheck2, FileWarning, Library, BarChartHorizontal, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { mockDataRequests, mockSupplierSubmissionStatus } from "@/lib/mock-data";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, LabelList, Cell, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

const statusConfig = {
    "Action Required": { variant: "destructive" as "destructive", icon: FileWarning },
    "Submitted": { variant: "secondary" as "secondary", icon: Upload },
    "Approved": { variant: "default" as "default", icon: FileCheck2 },
};

const submissionStatusConfig = {
  "Action Required": { label: "Action Required", color: "hsl(var(--chart-5))" },
  "Submitted": { label: "Submitted", color: "hsl(var(--chart-3))" },
  "Approved": { label: "Approved", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export default function SupplierDashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Supplier Dashboard
          </h1>
          <p className="text-muted-foreground">
            Good to see you, Jean-Pierre. Here are your pending tasks and actions for Congo Minerals S.A.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><BarChartHorizontal className="text-primary"/> Submission Analytics</CardTitle>
              <CardDescription>Overview of your data request statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={submissionStatusConfig} className="h-40 w-full">
               <BarChart accessibilityLayer data={mockSupplierSubmissionStatus} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={100}
                />
                <XAxis dataKey="value" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" layout="vertical" radius={5}>
                    {mockSupplierSubmissionStatus.map((entry) => (
                        <Cell key={entry.name} fill={`var(--color-${entry.name.replace(/\s/g, '')})`} />
                    ))}
                   <LabelList dataKey="value" position="right" offset={8} className="fill-foreground text-xs" />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
              <CardTitle>Open Data Requests</CardTitle>
              <CardDescription>Actions you need to take for specific customer products.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
              {mockDataRequests.map((req) => {
                  const config = statusConfig[req.status as keyof typeof statusConfig];
                  return (
                      <Link
                          key={req.id}
                          href={`/supplier-portal/data-requests/${req.id}`}
                          className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
                      >
                          <config.icon
                              className={cn(
                                  'h-6 w-6 shrink-0',
                                  {
                                      'text-destructive': req.status === 'Action Required',
                                      'text-chart-3': req.status === 'Submitted',
                                      'text-chart-2': req.status === 'Approved',
                                  }
                              )}
                          />
                          <div className="flex-1">
                              <p className="font-semibold">{req.material} for {req.product}</p>
                              <p className="text-sm text-muted-foreground">
                                  From: <span className="font-medium text-foreground">{req.company}</span>
                              </p>
                          </div>
                          <div className="flex items-center gap-4">
                              <Badge variant={config.variant} className="hidden sm:flex">
                                  {req.status}
                              </Badge>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                      </Link>
                  )
              })}
              <Button variant="secondary" className="w-full mt-4" asChild>
                <Link href="/supplier-portal/my-materials">
                    <Library className="mr-2 h-4 w-4" /> Manage My Material Library
                </Link>
              </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
