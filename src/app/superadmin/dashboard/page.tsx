'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  TrendingUp,
  Activity,
  Users,
  Building,
  Wand2,
  Anchor,
  Star,
  Bug,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { 
    mockMonthlyOnboardingData, 
    mockUserActivity,
    mockInactiveCompanies,
    mockTopAiUsage,
    mockTopBlockchainUsage,
    mockTopFeatures,
    mockTopBugReporters,
} from '@/lib/mock-data';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  companies: { label: "Companies", color: "hsl(var(--chart-1))" },
  suppliers: { label: "Suppliers", color: "hsl(var(--chart-2))" },
  products: { label: "Products", color: "hsl(var(--chart-3))" },
  certificates: { label: "Certificates", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const getDaysSinceLoginColor = (days: number) => {
    if (days >= 90) return "text-destructive font-bold";
    if (days >= 60) return "text-yellow-600 font-semibold";
    if (days >= 30) return "text-muted-foreground";
    return "text-foreground";
}

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
      <header>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Platform Dashboard
          </h1>
          <p className="text-muted-foreground">
            A high-level overview of all activity on Passportify.
          </p>
      </header>
      
      <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><TrendingUp className="text-primary" /> Onboarding & Growth Trends</CardTitle>
            <CardDescription>Month-over-month growth of key platform entities.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <ResponsiveContainer>
                <BarChart data={mockMonthlyOnboardingData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="companies" fill="var(--color-companies)" radius={4} />
                  <Bar dataKey="suppliers" fill="var(--color-suppliers)" radius={4} />
                  <Bar dataKey="products" fill="var(--color-products)" radius={4} />
                  <Bar dataKey="certificates" fill="var(--color-certificates)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Activity className="text-primary"/> User Activity</CardTitle>
                    <CardDescription>Users with no recent login activity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Days Inactive</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockUserActivity.map(user => (
                                <TableRow key={user.email}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell className={`text-right ${getDaysSinceLoginColor(user.daysSinceLogin)}`}>{user.daysSinceLogin}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Building className="text-primary"/> Inactive Companies</CardTitle>
                    <CardDescription>Companies with no new data in over 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company</TableHead>
                                <TableHead className="text-right">Last Activity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockInactiveCompanies.map(company => (
                                <TableRow key={company.name}>
                                    <TableCell>{company.name}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{company.lastActivity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Bug className="text-primary"/> Top Bug Reporters</CardTitle>
                    <CardDescription>Users who have reported the most issues.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTopBugReporters.map(bug => (
                                <TableRow key={bug.user}>
                                    <TableCell>{bug.user}</TableCell>
                                    <TableCell className="text-right font-bold">{bug.count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </div>
        
        <Card>
            <CardHeader>
                 <CardTitle className="font-headline flex items-center gap-2"><Star className="text-primary"/> Top Company Usage</CardTitle>
                 <CardDescription>Identify power users and adoption of key features.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="features">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="features"><Star className="mr-2 h-4 w-4"/> Top Features</TabsTrigger>
                        <TabsTrigger value="ai"><Wand2 className="mr-2 h-4 w-4"/> Top AI Usage</TabsTrigger>
                        <TabsTrigger value="blockchain"><Anchor className="mr-2 h-4 w-4"/> Top Blockchain Usage</TabsTrigger>
                    </TabsList>
                    <TabsContent value="features">
                        <Table>
                            <TableBody>
                                {mockTopFeatures.map(item => (
                                    <TableRow key={item.feature}>
                                        <TableCell className="font-semibold">{item.feature}</TableCell>
                                        <TableCell>{item.usageCount} companies</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                     <TabsContent value="ai">
                        <Table>
                            <TableBody>
                                {mockTopAiUsage.map(item => (
                                    <TableRow key={item.company}>
                                        <TableCell className="font-semibold">{item.company}</TableCell>
                                        <TableCell>{item.value} AI extractions</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                     <TabsContent value="blockchain">
                        <Table>
                            <TableBody>
                                {mockTopBlockchainUsage.map(item => (
                                    <TableRow key={item.company}>
                                        <TableCell className="font-semibold">{item.company}</TableCell>
                                        <TableCell>{item.value} anchors created</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </main>
  );
}
