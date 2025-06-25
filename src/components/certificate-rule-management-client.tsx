

"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Industry, ProductCategory, CertificateRule } from "@/lib/types";
import { mockIndustries, mockCategories, mockCertificateRules } from "@/lib/mock-data";
import { suggestCertificateRules, type CertificateSuggestion } from "@/ai/flows/suggest-certificate-rules";

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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreHorizontal, Pen, Trash2, Wand2, Loader2 } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


const ruleFormSchema = z.object({
  certificate_type: z.string().min(2, "Certificate type is required."),
  description: z.string().min(10, "Description is required."),
  industry_id: z.string({ required_error: "Please select an industry." }),
  category_id: z.string().optional(),
  mandatory: z.boolean(),
  active: z.boolean(),
  trigger_condition_field: z.string().optional(),
  trigger_condition_operator: z.string().optional(),
  trigger_condition_value: z.string().optional(),
  material_filter_field: z.string().optional(),
  material_filter_operator: z.string().optional(),
  material_filter_value: z.string().optional(),
  expected_format: z.enum(['PDF', 'XML', 'JSON', 'Any']),
  validation_method: z.enum(['AI', 'Manual', 'External DB', 'QR']),
  issued_by: z.string().min(2, "Issuer is required."),
  validity_period_days: z.coerce.number().optional(),
  regulation_reference: z.string().min(3, "Regulation reference is required."),
});

type RuleFormData = z.infer<typeof ruleFormSchema>;

const aiFormSchema = z.object({
  productDescription: z.string().min(10, "Please provide a more detailed product description."),
  targetRegion: z.string().min(2, "Please enter a target region (e.g., EU).").default("EU"),
});
type AiFormData = z.infer<typeof aiFormSchema>;


export function CertificateRuleManagementClient() {
  const { toast } = useToast();
  const [rules, setRules] = useState<CertificateRule[]>(mockCertificateRules);
  const [industries] = useState<Industry[]>(mockIndustries);
  const [categories] = useState<ProductCategory[]>(mockCategories);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CertificateRule | null>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CertificateSuggestion[]>([]);

  const industryMap = useMemo(() => new Map(industries.map(i => [i.industry_id, i.industry_name])), [industries]);
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.category_id, c.category_name])), [categories]);

  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      certificate_type: "", description: "", industry_id: "", category_id: "",
      mandatory: true, active: true, 
      trigger_condition_field: "", trigger_condition_operator: "", trigger_condition_value: "",
      material_filter_field: "", material_filter_operator: "", material_filter_value: "",
      expected_format: "PDF", validation_method: "Manual", issued_by: "",
      regulation_reference: "",
    },
  });

  const aiForm = useForm<AiFormData>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      productDescription: "",
      targetRegion: "EU",
    },
  });

  const handleAdd = () => {
    setSelectedRule(null);
    form.reset({
      certificate_type: "", description: "", industry_id: "", category_id: "",
      mandatory: true, active: true, 
      trigger_condition_field: "", trigger_condition_operator: "", trigger_condition_value: "",
      material_filter_field: "", material_filter_operator: "", material_filter_value: "",
      expected_format: "PDF", validation_method: "Manual", issued_by: "",
      validity_period_days: undefined, regulation_reference: "",
    });
    setIsFormDialogOpen(true);
  };
  
  const handleAddFromSuggestion = (suggestion: CertificateSuggestion) => {
    setSelectedRule(null);
    form.reset({
      certificate_type: suggestion.certificateName,
      description: suggestion.description,
      regulation_reference: suggestion.regulation,
      industry_id: "",
      category_id: "",
      mandatory: true,
      active: true,
      expected_format: 'PDF',
      validation_method: 'Manual',
      issued_by: '',
    });
    setIsFormDialogOpen(true);
  };

  const handleEdit = (rule: CertificateRule) => {
    setSelectedRule(rule);
    form.reset({
      ...rule,
      category_id: rule.category_id || "",
      trigger_condition_field: rule.trigger_condition?.field,
      trigger_condition_operator: rule.trigger_condition?.operator,
      trigger_condition_value: String(rule.trigger_condition?.value ?? ''),
      material_filter_field: rule.material_filter?.field,
      material_filter_operator: rule.material_filter?.operator,
      material_filter_value: String(rule.material_filter?.value ?? ''),
    });
    setIsFormDialogOpen(true);
  };

  const handleDeletePrompt = (rule: CertificateRule) => {
    setSelectedRule(rule);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedRule) {
      setRules(rules => rules.filter(r => r.certificate_rule_id !== selectedRule.certificate_rule_id));
      toast({ title: "Rule Deleted", description: `"${selectedRule.certificate_type}" rule has been removed.` });
    }
    setIsDeleteDialogOpen(false);
    setSelectedRule(null);
  };

  async function handleGetSuggestions(data: AiFormData) {
    setIsAiLoading(true);
    setSuggestions([]);
    try {
      const result = await suggestCertificateRules(data);
      setSuggestions(result.suggestions);
      toast({ title: "Suggestions Ready", description: `AI found ${result.suggestions.length} potential rules.` });
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not get suggestions from AI." });
    } finally {
      setIsAiLoading(false);
    }
  }

  function onSubmit(data: RuleFormData) {
    let trigger_condition = {};
    if (data.trigger_condition_field && data.trigger_condition_operator && data.trigger_condition_value) {
        trigger_condition = {
            field: data.trigger_condition_field,
            operator: data.trigger_condition_operator,
            value: data.trigger_condition_value,
        };
    }
    let material_filter = {};
    if (data.material_filter_field && data.material_filter_operator && data.material_filter_value) {
        material_filter = {
            field: data.material_filter_field,
            operator: data.material_filter_operator,
            value: data.material_filter_value,
        };
    }

    const newRule: CertificateRule = {
      certificate_rule_id: selectedRule?.certificate_rule_id || `rule_${Date.now()}`,
      last_updated_at: new Date().toISOString(),
      certificate_type: data.certificate_type,
      description: data.description,
      industry_id: data.industry_id,
      category_id: data.category_id || undefined,
      mandatory: data.mandatory,
      active: data.active,
      expected_format: data.expected_format,
      validation_method: data.validation_method,
      issued_by: data.issued_by,
      validity_period_days: data.validity_period_days,
      regulation_reference: data.regulation_reference,
      trigger_condition: trigger_condition,
      material_filter: material_filter,
    };

    if (selectedRule) {
      setRules(rules => rules.map(r => r.certificate_rule_id === selectedRule.certificate_rule_id ? newRule : r));
      toast({ title: "Rule Updated" });
    } else {
      setRules([newRule, ...rules]);
      toast({ title: "Rule Added" });
    }
    setIsFormDialogOpen(false);
    setSelectedRule(null);
  }

  return (
    <TooltipProvider>
      <div>
        <div className="space-y-8">
        <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Wand2 className="text-primary"/> AI Certificate Advisor
              </CardTitle>
              <CardDescription>Describe your product, and the AI will suggest relevant certificate rules based on EU DPP regulations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...aiForm}>
                <form onSubmit={aiForm.handleSubmit(handleGetSuggestions)} className="space-y-4">
                  <FormField
                    control={aiForm.control}
                    name="productDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., An electric vehicle battery containing cobalt, nickel, and lithium, intended for sale in the EU market." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={aiForm.control}
                    name="targetRegion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Region</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., EU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isAiLoading}>
                    {isAiLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Thinking...</> : <><Wand2 className="mr-2 h-4 w-4" /> Get Suggestions</>}
                  </Button>
                </form>
              </Form>
              {suggestions.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold">AI Suggestions</h4>
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                      <div className="flex-1">
                        <p className="font-semibold">{suggestion.certificateName}</p>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Regulation: <span className="font-mono">{suggestion.regulation}</span></p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleAddFromSuggestion(suggestion)}>
                          <PlusCircle className="mr-2 h-4 w-4"/> Add as Rule
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline">Certificate Rule List</CardTitle>
                <CardDescription>Rules that determine required certificates for products.</CardDescription>
              </div>
              <Button onClick={handleAdd}><PlusCircle className="mr-2" /> Add Rule Manually</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate Type</TableHead>
                  <TableHead>Industry / Category</TableHead>
                  <TableHead>Mandatory</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.certificate_rule_id}>
                    <TableCell className="font-medium">{rule.certificate_type}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                          <span>{industryMap.get(rule.industry_id) || "N/A"}</span>
                          {rule.category_id && <span className="text-xs text-muted-foreground">{categoryMap.get(rule.category_id) || "N/A"}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.mandatory ? "default" : "secondary"}>
                        {rule.mandatory ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.active ? "default" : "secondary"}>
                        {rule.active ? "Active" : "Inactive"}
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
                          <DropdownMenuItem onClick={() => handleEdit(rule)}><Pen className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePrompt(rule)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="sm:max-w-[725px]">
            <DialogHeader>
              <DialogTitle className="font-headline">{selectedRule ? "Edit" : "Add New"} Certificate Rule</DialogTitle>
              <DialogDescription>Define the logic for requiring a specific certificate.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="certificate_type" render={({ field }) => (
                    <FormItem><FormLabel>Certificate Type</FormLabel><FormControl><Input placeholder="e.g., REACH" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="regulation_reference" render={({ field }) => (
                    <FormItem><FormLabel>Regulation Reference</FormLabel><FormControl><Input placeholder="e.g., EU 2023/1542" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the certificate requirement..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="industry_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select an industry" /></SelectTrigger></FormControl>
                        <SelectContent>{industries.map(i => <SelectItem key={i.industry_id} value={i.industry_id}>{i.industry_name}</SelectItem>)}</SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Category (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          {categories.map(c => <SelectItem key={c.category_id} value={c.category_id}>{c.category_name}</SelectItem>)}
                        </SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="issued_by" render={({ field }) => (
                      <FormItem><FormLabel>Issued By</FormLabel><FormControl><Input placeholder="e.g., Self-declared, TÜV" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="validity_period_days" render={({ field }) => (
                      <FormItem><FormLabel>Validity (Days)</FormLabel><FormControl><Input type="number" placeholder="e.g., 365" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="expected_format" render={({ field }) => (
                      <FormItem><FormLabel>Expected Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger></FormControl>
                          <SelectContent>{['PDF', 'XML', 'JSON', 'Any'].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="validation_method" render={({ field }) => (
                      <FormItem><FormLabel>Validation Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger></FormControl>
                          <SelectContent>{['AI', 'Manual', 'External DB', 'QR'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                </div>
                <Card className="bg-muted/50">
                  <CardHeader className="p-4">
                      <CardTitle className="text-base">Trigger Condition (Optional)</CardTitle>
                      <CardDescription className="text-xs">Apply this rule only if a specific condition is met. Leave blank if the rule always applies.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-3 gap-4">
                          <FormField control={form.control} name="trigger_condition_field" render={({ field }) => (
                              <FormItem><FormLabel>Field</FormLabel><FormControl><Input placeholder="e.g., hazardous_flag" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                          <FormField control={form.control} name="trigger_condition_operator" render={({ field }) => (
                              <FormItem><FormLabel>Operator</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl><SelectTrigger><SelectValue placeholder="Operator..."/></SelectTrigger></FormControl>
                                      <SelectContent>
                                          <SelectItem value="eq">Equals</SelectItem>
                                          <SelectItem value="neq">Not Equals</SelectItem>
                                          <SelectItem value="gt">Greater Than</SelectItem>
                                          <SelectItem value="lt">Less Than</SelectItem>
                                          <SelectItem value="contains">Contains</SelectItem>
                                      </SelectContent>
                                  </Select>
                              <FormMessage /></FormItem>
                          )}/>
                          <FormField control={form.control} name="trigger_condition_value" render={({ field }) => (
                              <FormItem><FormLabel>Value</FormLabel><FormControl><Input placeholder="e.g., true" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                      </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardHeader className="p-4">
                      <CardTitle className="text-base">Material Filter (Optional)</CardTitle>
                      <CardDescription className="text-xs">Apply this rule based on material composition.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-3 gap-4">
                          <FormField control={form.control} name="material_filter_field" render={({ field }) => (
                              <FormItem><FormLabel>Material Field</FormLabel><FormControl><Input placeholder="e.g., material_name" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                          <FormField control={form.control} name="material_filter_operator" render={({ field }) => (
                              <FormItem><FormLabel>Operator</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl><SelectTrigger><SelectValue placeholder="Operator..."/></SelectTrigger></FormControl>
                                      <SelectContent>
                                          <SelectItem value="eq">Equals</SelectItem>
                                          <SelectItem value="contains">Contains</SelectItem>
                                      </SelectContent>
                                  </Select>
                              <FormMessage /></FormItem>
                          )}/>
                          <FormField control={form.control} name="material_filter_value" render={({ field }) => (
                              <FormItem><FormLabel>Value</FormLabel><FormControl><Input placeholder="e.g., Cobalt" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                      </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="mandatory" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel>Mandatory</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="active" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <DialogFooter className="pt-4">
                  <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                  <Button type="submit">{selectedRule ? "Save Changes" : "Create Rule"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete the "{selectedRule?.certificate_type}" rule.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
