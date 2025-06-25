
"use client";

import type { CompanySubscription, SubscriptionPlan } from "@/lib/types";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, ArrowUpCircle, Package, Database, Download } from "lucide-react";

interface CompanyBillingClientProps {
  subscription: CompanySubscription;
  plan: SubscriptionPlan;
}

const mockBillingHistory = [
  { date: "2024-05-01", amount: 249.00, status: "Paid", invoiceId: "INV-2024-005" },
  { date: "2024-04-01", amount: 249.00, status: "Paid", invoiceId: "INV-2024-004" },
  { date: "2024-03-01", amount: 249.00, status: "Paid", invoiceId: "INV-2024-003" },
];

export function CompanyBillingClient({ subscription, plan }: CompanyBillingClientProps) {

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // -1 means unlimited
    if (limit === 0) return 100; // if limit is 0 and used is > 0
    return Math.min((used / limit) * 100, 100);
  };
  
  const statusConfig: Record<CompanySubscription['status'], { variant: "default" | "secondary" | "destructive" }> = {
    active: { variant: 'default' },
    trialing: { variant: 'secondary' },
    past_due: { variant: 'destructive' },
    canceled: { variant: 'destructive' },
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your current subscription details.</CardDescription>
            </div>
             <Badge variant={statusConfig[subscription.status].variant} className="capitalize">{subscription.status}</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-4">
              <h2 className="text-4xl font-bold">{plan.plan_name}</h2>
              <p className="text-2xl text-muted-foreground">${plan.monthly_price}/month</p>
            </div>
             <p className="text-sm text-muted-foreground mt-2">
                Your plan renews on {format(new Date(subscription.start_date).setDate(new Date(subscription.start_date).getDate() + 30), 'PPP')}.
            </p>
          </CardContent>
          <CardFooter className="flex-wrap gap-4">
            <Button><ArrowUpCircle className="mr-2"/> Upgrade Plan</Button>
            <Button variant="outline">Cancel Subscription</Button>
          </CardFooter>
        </Card>
        
        <Card>
           <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Your past invoices and payment history.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Invoice</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockBillingHistory.map(item => (
                            <TableRow key={item.invoiceId}>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>${item.amount.toFixed(2)}</TableCell>
                                <TableCell><Badge variant="default">{item.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-3 w-3"/>
                                        {item.invoiceId}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Usage This Month</CardTitle>
                <CardDescription>Your consumption against your plan's limits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="flex items-center gap-2"><Package className="text-muted-foreground"/> Products</span>
                        <span>{subscription.current_usage.products_created} / {plan.plan_features.max_products === -1 ? 'Unlimited' : plan.plan_features.max_products}</span>
                    </div>
                    <Progress value={getUsagePercentage(subscription.current_usage.products_created, plan.plan_features.max_products)} />
                </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="flex items-center gap-2"><Database className="text-muted-foreground"/> Storage</span>
                        <span>{subscription.current_usage.storage_used_gb} GB / {plan.plan_limits.storage_gb} GB</span>
                    </div>
                    <Progress value={getUsagePercentage(subscription.current_usage.storage_used_gb, plan.plan_limits.storage_gb)} />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> {plan.plan_features.max_products === -1 ? 'Unlimited' : plan.plan_features.max_products} Products</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> {plan.plan_features.suppliers_allowed ? "Supplier Management" : "No Supplier Management"}</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> {plan.plan_features.ai_support ? "AI Document Processing" : "No AI Support"}</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> {plan.plan_features.blockchain_support ? "Blockchain Anchoring" : "No Blockchain Support"}</div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
