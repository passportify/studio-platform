
"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import type { Supplier, TraceabilityRecord, MaterialSpecification } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreHorizontal, Pen, Trash2, Link as LinkIcon, Mail, ChevronsRight, Library, ListPlus } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { mockSupplierMaterialSpecs, mockSubSuppliers, mockTraceabilityData } from "@/lib/mock-data";


type DataRequest = {
    id: string;
    company: string;
    product: string;
    material: string;
    status: string;
    dueDate: string;
};

const subMaterialFormSchema = z.object({
  material_name: z.string().min(2, "Material name is required."),
  material_type: z.enum(['Raw', 'Subcomponent', 'Assembly', 'Additive']),
  quantity: z.coerce.number().positive("Quantity must be positive."),
  quantity_unit: z.enum(['kg', '%']),
  tier: z.coerce.number().int().min(2, "Tier must be at least 2."),
  supplier_id: z.string({ required_error: "Please select a supplier." }),
  origin_country: z.string().length(2, "Must be a 2-letter ISO country code.").toUpperCase(),
  conflict_minerals_flag: z.boolean(),
  is_recycled_material: z.boolean(),
  compliance_status: z.enum(['Pending', 'Verified', 'Rejected', 'Invited']),
});

type SubMaterialFormData = z.infer<typeof subMaterialFormSchema>;

export function SupplierDataRequestClient({ dataRequest }: { dataRequest: DataRequest }) {
  const { toast } = useToast();
  const [records, setRecords] = useState<TraceabilityRecord[]>(mockTraceabilityData);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [isLibraryFormOpen, setIsLibraryFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TraceabilityRecord | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [supplierToInvite, setSupplierToInvite] = useState<any | null>(null);

  const supplierMap = useMemo(() => new Map(mockSubSuppliers.map(s => [s.supplier_id, s.legal_entity_name])), []);
  const filteredRecords = useMemo(() => records.filter(r => r.parent_trace_id === 'trace_2'), [records]);

  const form = useForm<SubMaterialFormData>({
    resolver: zodResolver(subMaterialFormSchema),
    defaultValues: {
      material_name: "", material_type: "Raw", quantity: 0, quantity_unit: "%", tier: 2, supplier_id: "", origin_country: "",
      conflict_minerals_flag: false, is_recycled_material: false, compliance_status: "Pending",
    },
  });
  
  const handleAddManually = () => {
    setSelectedRecord(null);
    form.reset({
        material_name: "", material_type: "Raw", quantity: 0, quantity_unit: "%", tier: 2, supplier_id: "", origin_country: "",
        conflict_minerals_flag: false, is_recycled_material: false, compliance_status: "Pending",
    });
    setIsManualFormOpen(true);
  };

  const handleEdit = (record: TraceabilityRecord) => {
    setSelectedRecord(record);
    form.reset(record);
    setIsManualFormOpen(true);
  };

  const handleInvite = (record: TraceabilityRecord) => {
    const supplier = mockSubSuppliers.find(s => s.supplier_id === record.supplier_id);
    if (supplier) {
        setSupplierToInvite(supplier);
        setIsInviteOpen(true);
    } else {
        toast({ variant: "destructive", title: "Sub-supplier not found" });
    }
  };
  
  const onSubmit = (data: SubMaterialFormData) => {
    const newRecord: TraceabilityRecord = {
      trace_id: selectedRecord?.trace_id || `subtrace_${Date.now()}`,
      product_id: dataRequest.id,
      material_id: selectedRecord?.material_id || `mat_${Date.now()}`,
      last_updated_at: new Date().toISOString(),
      ...data,
    };

    if (selectedRecord) {
      setRecords(recs => recs.map(r => r.trace_id === selectedRecord.trace_id ? newRecord : r));
      toast({ title: "Sub-material record updated." });
    } else {
      setRecords(recs => [newRecord, ...recs]);
      toast({ title: "Sub-material added to BOM." });
    }
    setIsManualFormOpen(false);
  };

  const handleSelectFromLibrary = (material: MaterialSpecification) => {
    const newRecord: TraceabilityRecord = {
        trace_id: `subtrace_${Date.now()}`,
        product_id: dataRequest.id,
        material_id: material.material_id,
        material_name: material.material_name,
        material_type: material.material_type,
        quantity: 1, // Default quantity
        quantity_unit: '%', // Default unit
        tier: 2, // Needs context, default to 2
        supplier_id: material.supplier_id, // This assumes self-supplied from library
        origin_country: '??', // Needs to be filled
        conflict_minerals_flag: false,
        compliance_status: 'Verified', // Assume library materials are verified
        is_recycled_material: false,
        last_updated_at: new Date().toISOString(),
    };
    setRecords(prev => [...prev, newRecord]);
    toast({ title: "Material Added", description: `Added "${material.material_name}" from your library.` });
    setIsLibraryFormOpen(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
      <header>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Fulfill Data Request
          </h1>
          <p className="text-muted-foreground">
            Provide the required traceability and compliance data for <span className="font-semibold text-foreground">{dataRequest.material}</span>.
          </p>
        </div>
      </header>
       <Card className="bg-muted/50 border-dashed">
            <CardHeader>
                <CardTitle className="text-base">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{dataRequest.company}</span>
                    <ChevronsRight className="text-muted-foreground" />
                    <span>{dataRequest.product}</span>
                    <ChevronsRight className="text-muted-foreground" />
                    <span className="font-semibold">{dataRequest.material}</span>
                </div>
                <div className="text-right">
                    <p>Status: <span className="font-semibold">{dataRequest.status}</span></p>
                    <p className="text-muted-foreground">Due: {format(new Date(dataRequest.dueDate), "PPP")}</p>
                </div>
            </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="font-headline">Upstream Bill of Materials</CardTitle>
              <CardDescription>Declare the sub-materials and suppliers for the <span className="font-semibold">{dataRequest.material}</span> you provide.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsLibraryFormOpen(true)}><Library className="mr-2 h-4 w-4"/> Add from Library</Button>
                <Button onClick={handleAddManually}><ListPlus className="mr-2 h-4 w-4"/> Add Manually</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sub-Material</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Your Supplier (Tier {records.find(r=>r.tier)?.tier || 'N'})</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length > 0 ? filteredRecords.map(rec => (
                <TableRow key={rec.trace_id}>
                  <TableCell className="font-medium">{rec.material_name}</TableCell>
                  <TableCell>{rec.quantity}{rec.quantity_unit}</TableCell>
                  <TableCell>{supplierMap.get(rec.supplier_id) || "Unknown"}</TableCell>
                  <TableCell>{rec.origin_country}</TableCell>
                  <TableCell>
                    <Badge variant={rec.compliance_status === 'Verified' ? 'default' : rec.compliance_status === 'Invited' ? 'secondary' : 'destructive'}>
                        {rec.compliance_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(rec)}><Pen className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem><LinkIcon className="mr-2 h-4 w-4" /> Link Documents</DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => handleInvite(rec)} 
                            disabled={mockSubSuppliers.find(s => s.supplier_id === rec.supplier_id)?.onboarding_status === 'Approved'}
                        >
                            <Mail className="mr-2 h-4 w-4" /> Invite Supplier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} className="text-center h-24">No sub-materials declared yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isManualFormOpen} onOpenChange={setIsManualFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedRecord ? 'Edit Sub-Material' : 'Add Sub-Material Manually'}</DialogTitle>
            <DialogDescription>Link a new sub-material or component.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <FormField control={form.control} name="material_name" render={({ field }) => (
                <FormItem><FormLabel>Sub-Material Name</FormLabel><FormControl><Input placeholder="e.g., Raw Cobalt Ore" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="quantity_unit" render={({ field }) => (
                  <FormItem><FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="%">%</SelectItem></SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="supplier_id" render={({ field }) => (
                <FormItem><FormLabel>Your Supplier</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select your supplier..." /></SelectTrigger></FormControl>
                    <SelectContent>{mockSubSuppliers.map(s => <SelectItem key={s.supplier_id} value={s.supplier_id}>{s.legal_entity_name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="tier" render={({ field }) => (
                  <FormItem><FormLabel>Tier</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="origin_country" render={({ field }) => (
                  <FormItem><FormLabel>Origin (ISO Code)</FormLabel><FormControl><Input placeholder="e.g., CD" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="is_recycled_material" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Is Recycled</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
                 <FormField control={form.control} name="conflict_minerals_flag" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Conflict Mineral</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">{selectedRecord ? 'Save Changes' : 'Add Material'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isLibraryFormOpen} onOpenChange={setIsLibraryFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">Select from Material Library</DialogTitle>
                <DialogDescription>Choose a pre-defined material to add to your submission.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[50vh] pr-4">
            <div className="py-4 space-y-2">
                {mockSupplierMaterialSpecs.map(material => (
                    <button key={material.material_id} onClick={() => handleSelectFromLibrary(material)} className="w-full text-left p-3 rounded-md border hover:bg-accent transition-colors">
                        <p className="font-semibold">{material.material_name}</p>
                        <p className="text-sm text-muted-foreground">{material.description}</p>
                    </button>
                ))}
            </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">Invite Sub-Supplier</DialogTitle>
                <DialogDescription>
                    Send an invitation to {supplierToInvite?.legal_entity_name} to provide compliance data for their materials.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <p className="text-sm">An email will be sent to <span className="font-semibold">{supplierToInvite?.contact_email}</span> with a secure link to the Supplier Portal.</p>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                <Button onClick={() => {
                    toast({ title: `Invitation sent to ${supplierToInvite?.legal_entity_name}` });
                    setIsInviteOpen(false);
                }}>
                    <Mail className="mr-2 h-4 w-4" /> Send Invitation
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Save as Draft</Button>
        <Button>Submit Data to UltraCell GmbH</Button>
      </div>
    </div>
  );
}
