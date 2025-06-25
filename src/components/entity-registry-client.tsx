
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Supplier } from "@/lib/types";
import { mockAllEntities } from "@/lib/mock-data";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreHorizontal, Pen, Trash2, Download } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


const entityFormSchema = z.object({
  legal_entity_name: z.string().min(2, "Legal name is required."),
  company_vat_number: z.string().min(5, "VAT number is required."),
  country_of_registration: z.string().min(2, "Country code is required.").max(2, "Must be a 2-letter ISO code."),
  registration_number: z.string().min(1, "Registration number is required."),
  brand_names: z.string().min(1, "At least one brand name is required."),
  entity_type: z.enum(["Manufacturer", "Brand Owner", "Supplier", "Importer", "Verifier"]),
  onboarding_status: z.enum(["Invited", "Approved", "Suspended", "Revoked"]),
  contact_email: z.string().email("Please enter a valid email."),
  primary_address: z.string().min(10, "Address is required."),
  declared_scope_of_submission: z.string().min(3, "Scope is required."),
  parent_company_id: z.string().optional(),
});

type EntityFormData = z.infer<typeof entityFormSchema>;

export function EntityRegistryClient() {
  const { toast } = useToast();
  const [entities, setEntities] = useState<Supplier[]>(mockAllEntities);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Supplier | null>(null);

  const statusConfig = {
    Approved: { variant: "default", label: "Approved" },
    Invited: { variant: "secondary", label: "Invited" },
    Suspended: { variant: "destructive", label: "Suspended" },
    Revoked: { variant: "destructive", label: "Revoked" },
  } as const;

  const form = useForm<EntityFormData>({
    resolver: zodResolver(entityFormSchema),
    defaultValues: {
      legal_entity_name: "",
      company_vat_number: "",
      country_of_registration: "",
      registration_number: "",
      brand_names: "",
      entity_type: "Supplier",
      onboarding_status: "Invited",
      contact_email: "",
      primary_address: "",
      declared_scope_of_submission: "",
      parent_company_id: "",
    },
  });

  const entityType = form.watch("entity_type");

  const handleAdd = () => {
    setSelectedEntity(null);
    form.reset({
      legal_entity_name: "",
      company_vat_number: "",
      country_of_registration: "",
      registration_number: "",
      brand_names: "",
      entity_type: "Supplier",
      onboarding_status: "Invited",
      contact_email: "",
      primary_address: "",
      declared_scope_of_submission: "",
      parent_company_id: "",
    });
    setIsFormOpen(true);
  };

  const handleEdit = (entity: Supplier) => {
    setSelectedEntity(entity);
    form.reset({
      ...entity,
      brand_names: entity.brand_names.join(", "),
      parent_company_id: "", // Not editable for now, only on creation
    });
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (entity: Supplier) => {
    setSelectedEntity(entity);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedEntity) return;
    setEntities(entities.filter(s => s.supplier_id !== selectedEntity.supplier_id));
    toast({ title: "Entity Deleted" });
    setIsDeleteOpen(false);
    setSelectedEntity(null);
  };

  const onSubmit = (data: EntityFormData) => {
    const brand_names = data.brand_names.split(",").map(s => s.trim()).filter(Boolean);

    if (selectedEntity) {
      const updatedEntity: Supplier = {
        ...selectedEntity,
        ...data,
        brand_names,
      };
      setEntities(entities.map(s => s.supplier_id === selectedEntity.supplier_id ? updatedEntity : s));
      toast({ title: "Entity Updated" });
    } else {
      const newEntity: Supplier = {
        supplier_id: `sup_${Date.now()}`,
        ...data,
        brand_names,
        associated_products_count: 0,
        created_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      };
      setEntities([newEntity, ...entities]);

      if (data.parent_company_id) {
        const parentCompany = entities.find(s => s.supplier_id === data.parent_company_id);
        toast({
          title: "Supplier Associated",
          description: `${data.legal_entity_name} has been added as a supplier to ${parentCompany?.legal_entity_name}. An invitation has been sent to ${data.contact_email}.`
        });
      } else {
        toast({ 
          title: "Entity Created & Invitation Sent",
          description: `An invitation to set up their portal has been sent to ${data.contact_email}.`
        });
      }
    }
    setIsFormOpen(false);
    setSelectedEntity(null);
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your entity data export is being generated. You will receive an email with the download link shortly.",
    });
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">All Registered Entities</CardTitle>
              <CardDescription>Master list of all entities on the platform.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2" />
                Export All
              </Button>
              <Button onClick={handleAdd}><PlusCircle className="mr-2" /> Add Entity</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Legal Entity Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.map((entity) => (
                <TableRow key={entity.supplier_id}>
                  <TableCell className="font-medium">{entity.legal_entity_name}</TableCell>
                  <TableCell>{entity.entity_type}</TableCell>
                  <TableCell>{entity.country_of_registration}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[entity.onboarding_status].variant}>
                      {statusConfig[entity.onboarding_status].label}
                    </Badge>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(entity)}><Pen className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePrompt(entity)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedEntity ? "Edit" : "Onboard New"} Entity</DialogTitle>
            <DialogDescription>
              Create a new company profile on the platform. An invitation will be sent to the contact email, allowing them to set up their own dedicated portal.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <FormField control={form.control} name="legal_entity_name" render={({ field }) => (
                <FormItem><FormLabel>Legal Entity Name</FormLabel><FormControl><Input placeholder="e.g., UltraCell GmbH" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField control={form.control} name="company_vat_number" render={({ field }) => (
                  <FormItem><FormLabel>VAT Number</FormLabel><FormControl><Input placeholder="e.g., DE123456789" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="registration_number" render={({ field }) => (
                  <FormItem><FormLabel>Registration Number</FormLabel><FormControl><Input placeholder="e.g., HRB 12345 B" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="country_of_registration" render={({ field }) => (
                  <FormItem><FormLabel>Country (ISO)</FormLabel><FormControl><Input placeholder="e.g., DE" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
               <FormField control={form.control} name="brand_names" render={({ field }) => (
                <FormItem><FormLabel>Brand Names</FormLabel><FormControl><Input placeholder="e.g., Brand A, Brand B" {...field} /></FormControl><FormDescription>Comma-separated list of brands.</FormDescription><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contact_email" render={({ field }) => (
                <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" placeholder="e.g., contact@company.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="primary_address" render={({ field }) => (
                <FormItem><FormLabel>Primary Address</FormLabel><FormControl><Textarea placeholder="Enter the full legal address..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="entity_type" render={({ field }) => (
                  <FormItem><FormLabel>Entity Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["Manufacturer", "Brand Owner", "Supplier", "Importer", "Verifier"].map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="onboarding_status" render={({ field }) => (
                  <FormItem><FormLabel>Onboarding Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                         {Object.entries(statusConfig).map(([key, config]) => <SelectItem key={key} value={key}>{config.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="declared_scope_of_submission" render={({ field }) => (
                <FormItem><FormLabel>Declared Scope</FormLabel><FormControl><Textarea placeholder="e.g., Batteries, Textiles, EEE" {...field} /></FormControl><FormDescription>Comma-separated list of industries or product types this entity supplies.</FormDescription><FormMessage /></FormItem>
              )} />
              
              {!selectedEntity && entityType === 'Supplier' && (
                <FormField
                    control={form.control}
                    name="parent_company_id"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Associate with Company (Customer)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === '__NONE__' ? '' : value)} value={field.value || ""}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a customer to associate this supplier with..." />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="__NONE__">None (Onboard as a new top-level customer)</SelectItem>
                            {entities
                            .filter(s => s.entity_type === 'Manufacturer' || s.entity_type === 'Brand Owner')
                            .map(company => (
                                <SelectItem key={company.supplier_id} value={company.supplier_id}>
                                    {company.legal_entity_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormDescription>
                          If a customer is selected, this entity will be onboarded as their supplier. Otherwise, they will be onboarded as a new customer.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}

              <DialogFooter className="pt-4">
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">{selectedEntity ? "Save Changes" : "Create Entity"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the "{selectedEntity?.legal_entity_name}" entity.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
