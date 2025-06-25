"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Supplier } from "@/lib/types";
import { mockCompanySuppliers } from "@/lib/mock-data";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Mail, Download } from "lucide-react";
import { Textarea } from "./ui/textarea";

// The form schema no longer includes entity_type, as it will be hardcoded.
const onboardingFormSchema = z.object({
  legal_entity_name: z.string().min(2, "Legal name is required."),
  contact_email: z.string().email("Please enter a valid email address."),
  primary_address: z.string().min(10, "Address is required."),
  country_of_registration: z.string().length(2, "Must be a 2-letter ISO code.").toUpperCase(),
  company_vat_number: z.string().min(5, "VAT number is required."),
  registration_number: z.string().min(1, "Registration number is required."),
});

type OnboardingFormData = z.infer<typeof onboardingFormSchema>;

export function CompanySuppliersClient() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState(mockCompanySuppliers);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: { legal_entity_name: "", contact_email: "" },
  });

  const onSubmit = (data: OnboardingFormData) => {
    const newSupplier: Supplier = {
      supplier_id: `sup_${Date.now()}`,
      ...data,
      entity_type: "Supplier", // Hardcoded to 'Supplier' for this portal
      brand_names: [], // Initially empty
      declared_scope_of_submission: "N/A", // Can be edited later
      onboarding_status: "Invited",
      associated_products_count: 0,
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    toast({ title: "Invitation Sent", description: `An invitation has been sent to ${data.legal_entity_name}.` });
    setIsInviteOpen(false);
    form.reset();
  };
  
  const statusConfig = {
    Approved: { variant: "default" as const },
    Invited: { variant: "secondary" as const },
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your supplier data export is being generated. You will receive an email with the download link shortly.",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Suppliers</CardTitle>
              <CardDescription>A list of all suppliers linked to your company.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export All
              </Button>
              <Button onClick={() => setIsInviteOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Invite Supplier
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Legal Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length > 0 ? (
                suppliers.map(supplier => (
                  <TableRow key={supplier.supplier_id}>
                    <TableCell className="font-medium">{supplier.legal_entity_name}</TableCell>
                    <TableCell>{supplier.contact_email}</TableCell>
                     <TableCell>{supplier.country_of_registration}</TableCell>
                     <TableCell>{supplier.associated_products_count}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[supplier.onboarding_status as keyof typeof statusConfig].variant}>
                        {supplier.onboarding_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No suppliers invited yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Onboard New Supplier</DialogTitle>
            <DialogDescription>
              The supplier will receive an email to join the portal. Enter their legal information to create their profile.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
               <FormField control={form.control} name="legal_entity_name" render={({ field }) => (
                  <FormItem><FormLabel>Supplier Legal Name</FormLabel><FormControl><Input placeholder="e.g., Global Materials Corp." {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
               <FormField control={form.control} name="contact_email" render={({ field }) => (
                  <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" placeholder="e.g., procurement@globalmaterials.com" {...field} /></FormControl><FormMessage /></FormItem>
                )}
              />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* The Entity Type dropdown has been removed to enforce 'Supplier' only */}
                 <FormField control={form.control} name="country_of_registration" render={({ field }) => (
                  <FormItem><FormLabel>Country (ISO)</FormLabel><FormControl><Input placeholder="e.g., DE" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="company_vat_number" render={({ field }) => (
                  <FormItem><FormLabel>VAT Number</FormLabel><FormControl><Input placeholder="e.g., DE123456789" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
               <FormField control={form.control} name="registration_number" render={({ field }) => (
                  <FormItem><FormLabel>Company Reg. Number</FormLabel><FormControl><Input placeholder="e.g., HRB 12345 B" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
               <FormField control={form.control} name="primary_address" render={({ field }) => (
                <FormItem><FormLabel>Primary Address</FormLabel><FormControl><Textarea placeholder="Enter the full legal address..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">
                  <Mail className="mr-2 h-4 w-4" /> Send Invitation
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
