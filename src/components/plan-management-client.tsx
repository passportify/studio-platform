"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Supplier, SubscriptionPlan, CompanySubscription } from "@/lib/types";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreHorizontal, Pen, Trash2 } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


interface PlanClientProps {
  initialPlans: SubscriptionPlan[];
  initialSubscriptions: CompanySubscription[];
  companies: Supplier[];
}

const planFormSchema = z.object({
  plan_name: z.string().min(3, "Plan name is required."),
  monthly_price: z.coerce.number().min(0, "Price must be non-negative."),
  billing_cycle: z.enum(['monthly', 'annually']),
  trial_days: z.coerce.number().int().min(0),
  is_active: z.boolean(),

  // Limits
  limit_storage_gb: z.coerce.number().int().min(0),
  limit_dpp_generations_monthly: z.coerce.number().int().min(-1, "Use -1 for unlimited."),

  // Features
  feature_max_products: z.coerce.number().int().min(-1, "Use -1 for unlimited."),
  feature_suppliers_allowed: z.boolean(),
  feature_ai_support: z.boolean(),
  feature_blockchain_support: z.boolean(),

  default_modules: z.string().optional(),
});


type PlanFormData = z.infer<typeof planFormSchema>;

export function PlanManagementClient({ initialPlans, initialSubscriptions, companies }: PlanClientProps) {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans);
  const [subscriptions, setSubscriptions] = useState<CompanySubscription[]>(initialSubscriptions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const planMap = useMemo(() => new Map(plans.map(p => [p.plan_id, p.plan_name])), [plans]);
  const companyMap = useMemo(() => new Map(companies.map(c => [c.supplier_id, c.legal_entity_name])), [companies]);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      plan_name: "", monthly_price: 0, billing_cycle: "monthly", trial_days: 0, is_active: true,
      limit_storage_gb: 0, limit_dpp_generations_monthly: 0,
      feature_max_products: 0, feature_suppliers_allowed: false, feature_ai_support: false, feature_blockchain_support: false,
      default_modules: "",
    },
  });

  const handleAdd = () => {
    setSelectedPlan(null);
    form.reset({
      plan_name: "", monthly_price: 0, billing_cycle: "monthly", trial_days: 0, is_active: true,
      limit_storage_gb: 0, limit_dpp_generations_monthly: 0,
      feature_max_products: 0, feature_suppliers_allowed: false, feature_ai_support: false, feature_blockchain_support: false,
      default_modules: "",
    });
    setIsFormOpen(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    form.reset({
      ...plan,
      limit_storage_gb: plan.plan_limits.storage_gb,
      limit_dpp_generations_monthly: plan.plan_limits.dpp_generations_monthly,
      feature_max_products: plan.plan_features.max_products,
      feature_suppliers_allowed: plan.plan_features.suppliers_allowed,
      feature_ai_support: plan.plan_features.ai_support,
      feature_blockchain_support: plan.plan_features.blockchain_support,
      default_modules: plan.default_modules.join(", "),
    });
    setIsFormOpen(true);
  };
  
  const onSubmit = (data: PlanFormData) => {
    const newPlanData: SubscriptionPlan = {
        plan_id: selectedPlan?.plan_id || `plan_${Date.now()}`,
        plan_name: data.plan_name,
        monthly_price: data.monthly_price,
        billing_cycle: data.billing_cycle,
        trial_days: data.trial_days,
        is_active: data.is_active,
        plan_features: {
            max_products: data.feature_max_products,
            suppliers_allowed: data.feature_suppliers_allowed,
            ai_support: data.feature_ai_support,
            blockchain_support: data.feature_blockchain_support,
        },
        plan_limits: {
            storage_gb: data.limit_storage_gb,
            dpp_generations_monthly: data.limit_dpp_generations_monthly,
        },
        default_modules: data.default_modules ? data.default_modules.split(',').map(s => s.trim()) : [],
    };
    
    if (selectedPlan) {
        setPlans(prev => prev.map(p => p.plan_id === selectedPlan.plan_id ? newPlanData : p));
        toast({ title: "Plan Updated" });
    } else {
        setPlans(prev => [...prev, newPlanData]);
        toast({ title: "Plan Created" });
    }
    setIsFormOpen(false);
  };

  const statusConfig: Record<CompanySubscription['status'], { variant: "default" | "secondary" | "destructive" }> = {
    active: { variant: 'default' },
    trialing: { variant: 'secondary' },
    past_due: { variant: 'destructive' },
    canceled: { variant: 'destructive' },
  };

  return (
    <TooltipProvider>
    <Tabs defaultValue="plans">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="plans">Plan Management</TabsTrigger>
        <TabsTrigger value="subscriptions">Company Subscriptions</TabsTrigger>
      </TabsList>
      <TabsContent value="plans">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Available Plans</CardTitle>
              <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add Plan</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.plan_id}>
                    <TableCell className="font-medium">{plan.plan_name}</TableCell>
                    <TableCell>${plan.monthly_price.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{plan.billing_cycle}</TableCell>
                    <TableCell><Badge variant={plan.is_active ? 'default' : 'secondary'}>{plan.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                         <Tooltip>
                           <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Options</p>
                           </TooltipContent>
                         </Tooltip>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(plan)}><Pen className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="subscriptions">
         <Card>
          <CardHeader>
            <CardTitle>Company Subscriptions</CardTitle>
            <CardDescription>Overview of which companies are on which plans.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                    <TableRow key={sub.company_id}>
                        <TableCell className="font-medium">{companyMap.get(sub.company_id) || 'Unknown Company'}</TableCell>
                        <TableCell>{planMap.get(sub.plan_id) || 'Unknown Plan'}</TableCell>
                        <TableCell><Badge variant={statusConfig[sub.status].variant} className="capitalize">{sub.status}</Badge></TableCell>
                        <TableCell>{format(new Date(sub.start_date), 'PPP')}</TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedPlan ? "Edit" : "Add New"} Plan</DialogTitle>
            <DialogDescription>Define the details, features, and limits for a subscription plan.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
               <div className="space-y-4">
                 <h4 className="text-sm font-medium">Core Details</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="plan_name" render={({ field }) => (
                        <FormItem><FormLabel>Plan Name</FormLabel><FormControl><Input placeholder="e.g., Professional" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="monthly_price" render={({ field }) => (
                        <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" placeholder="249" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="billing_cycle" render={({ field }) => (
                        <FormItem><FormLabel>Billing Cycle</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="annually">Annually</SelectItem></SelectContent>
                        </Select>
                        <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="trial_days" render={({ field }) => (
                        <FormItem><FormLabel>Trial Days</FormLabel><FormControl><Input type="number" placeholder="14" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
               </div>

              <div className="space-y-4">
                 <h4 className="text-sm font-medium">Usage Limits</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <FormField control={form.control} name="limit_storage_gb" render={({ field }) => (
                        <FormItem><FormLabel>Storage (GB)</FormLabel><FormControl><Input type="number" placeholder="50" {...field} /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="limit_dpp_generations_monthly" render={({ field }) => (
                        <FormItem><FormLabel>DPP Generations</FormLabel><FormControl><Input type="number" placeholder="1000" {...field} /></FormControl><FormDescription>Use -1 for unlimited</FormDescription><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="feature_max_products" render={({ field }) => (
                        <FormItem><FormLabel>Max Products</FormLabel><FormControl><Input type="number" placeholder="50" {...field} /></FormControl><FormDescription>Use -1 for unlimited</FormDescription><FormMessage /></FormItem>
                     )} />
                 </div>
              </div>
              
              <div className="space-y-4">
                 <h4 className="text-sm font-medium">Feature Flags</h4>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField control={form.control} name="feature_suppliers_allowed" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Suppliers</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="feature_ai_support" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>AI Support</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )} />
                     <FormField control={form.control} name="feature_blockchain_support" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Blockchain</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )} />
                      <FormField control={form.control} name="is_active" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Plan is Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )} />
                 </div>
              </div>

               <div className="space-y-4">
                 <h4 className="text-sm font-medium">Included Modules</h4>
                 <FormField control={form.control} name="default_modules" render={({ field }) => (
                    <FormItem><FormLabel>Default Module IDs</FormLabel><FormControl><Input placeholder="mod_dpp, mod_qr" {...field} /></FormControl><FormDescription>Comma-separated list of module IDs to enable by default.</FormDescription><FormMessage /></FormItem>
                 )} />
               </div>

              <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">{selectedPlan ? "Save Changes" : "Create Plan"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Tabs>
    </TooltipProvider>
  );
}
