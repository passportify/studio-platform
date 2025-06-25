
"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Supplier, TraceabilityRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { mockCompanySuppliers, mockTraceabilityData } from "@/lib/mock-data";


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
import { PlusCircle, MoreHorizontal, Pen, Trash2, Link as LinkIcon, Mail, CornerDownRight, ChevronDown, ChevronRight, Share2, CheckCircle, FileClock, XCircle, CircleHelp } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


const traceFormSchema = z.object({
  material_name: z.string().min(2, "Material name is required."),
  material_type: z.enum(['Raw', 'Subcomponent', 'Assembly', 'Additive']),
  quantity: z.coerce.number().positive("Quantity must be positive."),
  quantity_unit: z.enum(['kg', '%']),
  tier: z.coerce.number().int().min(1, "Tier must be at least 1."),
  supplier_id: z.string({ required_error: "Please select a supplier." }),
  origin_country: z.string().length(2, "Must be a 2-letter ISO country code.").toUpperCase(),
  conflict_minerals_flag: z.boolean(),
  is_recycled_material: z.boolean(),
  compliance_status: z.enum(['Pending', 'Verified', 'Rejected', 'Invited']),
});

type TraceFormData = z.infer<typeof traceFormSchema>;

const inviteFormSchema = z.object({
  legal_entity_name: z.string().min(2, "Legal name is required."),
  contact_email: z.string().email("Please enter a valid email address."),
});
type InviteFormData = z.infer<typeof inviteFormSchema>;


type ComplianceStatus = TraceabilityRecord['compliance_status'];

const statusConfig: Record<ComplianceStatus, { icon: React.ElementType, color: string, badge: "default" | "secondary" | "destructive" }> = {
    Verified: { icon: CheckCircle, color: 'text-green-600', badge: 'default' },
    Pending: { icon: FileClock, color: 'text-yellow-600', badge: 'secondary' },
    Rejected: { icon: XCircle, color: 'text-red-600', badge: 'destructive' },
    Invited: { icon: Mail, color: 'text-blue-600', badge: 'secondary' },
};


const SupplyChainNode = ({ node, allNodes, supplierMap, onStatusChange, level = 0 }: { node: TraceabilityRecord, allNodes: TraceabilityRecord[], supplierMap: Map<string, string>, onStatusChange: (id: string, status: ComplianceStatus) => void, level?: number }) => {
  const [isOpen, setIsOpen] = useState(level < 2);
  const children = allNodes.filter(n => n.parent_trace_id === node.trace_id);
  const config = statusConfig[node.compliance_status] || { icon: CircleHelp, color: 'text-gray-500', badge: 'secondary' };

  return (
    <div className={cn(level > 0 && "pl-4")}>
        <div className="flex items-center gap-2 py-2 rounded-md hover:bg-muted/50 pr-2 group">
            {children.length > 0 ? (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                </Button>
            ) : (
                <div className="w-6 h-6 flex items-center justify-center">
                    <CornerDownRight className="h-4 w-4 text-muted-foreground/50"/>
                </div>
            )}
            <config.icon className={cn("h-5 w-5 shrink-0", config.color)} />
            <div className="flex-1">
                <p className="font-semibold">{node.material_name} <span className="font-normal text-muted-foreground">({node.quantity}{node.quantity_unit})</span></p>
                <p className="text-xs text-muted-foreground">
                    Supplier: <span className="font-medium text-foreground">{supplierMap.get(node.supplier_id) || 'Unknown'}</span> | Origin: {node.origin_country} | Tier {node.tier}
                </p>
            </div>
             <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Options</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                    {node.compliance_status === 'Pending' && (
                        <>
                            <DropdownMenuItem onClick={() => onStatusChange(node.trace_id, 'Verified')}><CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Approve Submission</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange(node.trace_id, 'Rejected')} className="text-destructive"><XCircle className="mr-2 h-4 w-4"/> Reject Submission</DropdownMenuItem>
                        </>
                    )}
                     {node.compliance_status === 'Invited' && (
                        <DropdownMenuItem><Mail className="mr-2 h-4 w-4"/> Resend Invite</DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        {isOpen && children.map(child => (
            <SupplyChainNode key={child.trace_id} node={child} allNodes={allNodes} supplierMap={supplierMap} level={level + 1} onStatusChange={onStatusChange} />
        ))}
    </div>
  );
};


export function CompanyProductTraceabilityClient({ productId }: { productId: string }) {
  const { toast } = useToast();
  const [records, setRecords] = useState<TraceabilityRecord[]>(mockTraceabilityData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TraceabilityRecord | null>(null);
  const [isDataRequestInviteOpen, setIsDataRequestInviteOpen] = useState(false);
  const [isQuickInviteOpen, setIsQuickInviteOpen] = useState(false);
  const [supplierToInvite, setSupplierToInvite] = useState<Supplier | null>(null);
  const [companySuppliers, setCompanySuppliers] = useState<Supplier[]>(mockCompanySuppliers);

  const supplierMap = useMemo(() => new Map(companySuppliers.map(s => [s.supplier_id, s.legal_entity_name])), [companySuppliers]);
  const { filteredRecords, recordTree } = useMemo(() => {
    const filtered = records.filter(r => r.product_id === productId);
    const tree = filtered.filter(r => !r.parent_trace_id);
    return { filteredRecords: filtered, recordTree: tree };
  }, [records, productId]);

  const traceForm = useForm<TraceFormData>({
    resolver: zodResolver(traceFormSchema),
    defaultValues: {
      material_name: "", material_type: "Raw", quantity: 0, quantity_unit: "%", tier: 1, supplier_id: "", origin_country: "",
      conflict_minerals_flag: false, is_recycled_material: false, compliance_status: "Pending",
    },
  });

  const inviteForm = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
  });
  
  const handleUpdateStatus = (traceId: string, status: ComplianceStatus) => {
    setRecords(prev => prev.map(rec => rec.trace_id === traceId ? { ...rec, compliance_status: status } : rec));
    toast({ title: `Record status updated to ${status}` });
  };
  
  const handleAdd = () => {
    setSelectedRecord(null);
    traceForm.reset({
        material_name: "", material_type: "Raw", quantity: 0, quantity_unit: "%", tier: 1, supplier_id: "", origin_country: "",
        conflict_minerals_flag: false, is_recycled_material: false, compliance_status: "Pending",
    });
    setIsFormOpen(true);
  };

  const handleEdit = (record: TraceabilityRecord) => {
    setSelectedRecord(record);
    traceForm.reset(record);
    setIsFormOpen(true);
  };

  const handleInvite = (record: TraceabilityRecord) => {
    const supplier = companySuppliers.find(s => s.supplier_id === record.supplier_id);
    if (supplier) {
        setSupplierToInvite(supplier);
        setIsDataRequestInviteOpen(true);
    } else {
        toast({ variant: "destructive", title: "Supplier not found" });
    }
  };
  
  const onTraceSubmit = (data: TraceFormData) => {
    const newRecord: TraceabilityRecord = {
      trace_id: selectedRecord?.trace_id || `trace_${Date.now()}`,
      product_id: productId,
      material_id: selectedRecord?.material_id || `mat_${Date.now()}`,
      last_updated_at: new Date().toISOString(),
      parent_trace_id: selectedRecord?.parent_trace_id,
      ...data,
    };

    if (selectedRecord) {
      setRecords(recs => recs.map(r => r.trace_id === selectedRecord.trace_id ? newRecord : r));
      toast({ title: "Material record updated." });
    } else {
      setRecords(recs => [newRecord, ...recs]);
      toast({ title: "Material added to product." });
    }
    setIsFormOpen(false);
  };

  const onInviteSubmit = (data: InviteFormData) => {
    const newSupplier: Supplier = {
      supplier_id: `sup_${Date.now()}`,
      legal_entity_name: data.legal_entity_name,
      contact_email: data.contact_email,
      onboarding_status: 'Invited',
      entity_type: 'Supplier',
      country_of_registration: '',
      company_vat_number: '',
      registration_number: '',
      brand_names: [],
      primary_address: '',
      declared_scope_of_submission: '',
      associated_products_count: 0,
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    };
    setCompanySuppliers(prev => [...prev, newSupplier]);
    toast({ title: 'Supplier Invited', description: `An invitation has been sent to ${data.legal_entity_name}.` });
    setIsQuickInviteOpen(false);
    inviteForm.reset();
  };

  return (
    <TooltipProvider>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="font-headline flex items-center gap-2"><Share2 className="text-primary"/>Supply Chain Graph</CardTitle>
                <CardDescription>Visual representation of the product's upstream supply chain.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recordTree.length > 0 ? (
              <div className="space-y-1">
                {recordTree.map(node => <SupplyChainNode key={node.trace_id} node={node} allNodes={filteredRecords} supplierMap={supplierMap} onStatusChange={handleUpdateStatus} />)}
              </div>
            ) : (
              <div className="text-center h-24 flex items-center justify-center text-muted-foreground">No traceability data to display.</div>
            )}
          </CardContent>
        </Card>
      
        <Card className="lg:col-span-2">
            <CardHeader>
            <div className="flex items-center justify-between mb-4">
                <div>
                <CardTitle className="font-headline">Bill of Materials (Table View)</CardTitle>
                <CardDescription>All materials and components required for this product.</CardDescription>
                </div>
                <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4"/> Add Material</Button>
            </div>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredRecords.length > 0 ? filteredRecords.map(rec => {
                    const config = statusConfig[rec.compliance_status] || { icon: CircleHelp, color: 'text-gray-500', badge: 'secondary' };
                    return (
                        <TableRow key={rec.trace_id}>
                        <TableCell className="font-medium">{rec.material_name}</TableCell>
                        <TableCell>{rec.quantity}{rec.quantity_unit}</TableCell>
                        <TableCell>{supplierMap.get(rec.supplier_id) || "Unknown"}</TableCell>
                        <TableCell>{rec.origin_country}</TableCell>
                        <TableCell>
                            <Badge variant={config.badge} className="gap-1.5">
                                <config.icon className="size-3.5"/>
                                {rec.compliance_status}
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
                                {rec.compliance_status === 'Pending' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleUpdateStatus(rec.trace_id, 'Verified')}><CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Approve</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateStatus(rec.trace_id, 'Rejected')} className="text-destructive"><XCircle className="mr-2 h-4 w-4"/> Reject</DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuItem onClick={() => handleEdit(rec)}><Pen className="mr-2 h-4 w-4" /> Edit Record</DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => handleInvite(rec)} 
                                    disabled={companySuppliers.find(s => s.supplier_id === rec.supplier_id)?.onboarding_status === 'Approved'}
                                >
                                    <Mail className="mr-2 h-4 w-4" /> Invite Supplier
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    )
                }) : (
                    <TableRow><TableCell colSpan={6} className="text-center h-24">No materials linked yet.</TableCell></TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedRecord ? 'Edit Material' : 'Add Material'}</DialogTitle>
            <DialogDescription>Link a new material or subcomponent to the selected product.</DialogDescription>
          </DialogHeader>
          <Form {...traceForm}>
            <form onSubmit={traceForm.handleSubmit(onTraceSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <FormField control={traceForm.control} name="material_name" render={({ field }) => (
                <FormItem><FormLabel>Material Name</FormLabel><FormControl><Input placeholder="e.g., Lithium Carbonate" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={traceForm.control} name="quantity" render={({ field }) => (
                  <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={traceForm.control} name="quantity_unit" render={({ field }) => (
                  <FormItem><FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="%">%</SelectItem></SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={traceForm.control} name="supplier_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                    <div className="flex gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a supplier..." /></SelectTrigger></FormControl>
                            <SelectContent>{companySuppliers.map(s => <SelectItem key={s.supplier_id} value={s.supplier_id}>{s.legal_entity_name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button type="button" variant="outline" onClick={() => setIsQuickInviteOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Invite
                        </Button>
                    </div>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={traceForm.control} name="tier" render={({ field }) => (
                  <FormItem><FormLabel>Tier</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={traceForm.control} name="origin_country" render={({ field }) => (
                  <FormItem><FormLabel>Origin (ISO Code)</FormLabel><FormControl><Input placeholder="e.g., CD" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={traceForm.control} name="is_recycled_material" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Is Recycled</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
                 <FormField control={traceForm.control} name="conflict_minerals_flag" render={({ field }) => (
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
      
      <Dialog open={isQuickInviteOpen} onOpenChange={setIsQuickInviteOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">Quick Invite Supplier</DialogTitle>
                <DialogDescription>
                    Invite a new supplier to your network. They will appear in the dropdown after being invited.
                </DialogDescription>
            </DialogHeader>
            <Form {...inviteForm}>
              <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4 py-4">
                 <FormField control={inviteForm.control} name="legal_entity_name" render={({ field }) => (
                    <FormItem><FormLabel>Supplier Legal Name</FormLabel><FormControl><Input placeholder="e.g., Global Materials Corp." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                 <FormField control={inviteForm.control} name="contact_email" render={({ field }) => (
                    <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" placeholder="e.g., procurement@globalmaterials.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit"><Mail className="mr-2 h-4 w-4" /> Send Invitation</Button>
                </DialogFooter>
              </form>
            </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDataRequestInviteOpen} onOpenChange={setIsDataRequestInviteOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">Request Data from Supplier</DialogTitle>
                <DialogDescription>
                    Send a data request to {supplierToInvite?.legal_entity_name} to provide traceability data for their part in the supply chain.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <p className="text-sm">An email will be sent to <span className="font-semibold">{supplierToInvite?.contact_email}</span> with a secure link to the Supplier Portal where they can fulfill your request.</p>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                <Button onClick={() => {
                    toast({ title: `Data request sent to ${supplierToInvite?.legal_entity_name}` });
                    setIsDataRequestInviteOpen(false);
                }}>
                    <Mail className="mr-2 h-4 w-4" /> Send Request
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
