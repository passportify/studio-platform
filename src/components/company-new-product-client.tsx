
"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { complianceCheck } from "@/ai/flows/compliance-check";
import type { ComplianceCheckOutput } from "@/ai/flows/compliance-check";
import type { Industry, ProductCategory, FormTemplate, FormTemplateField, CertificateRule } from "@/lib/types";
import { format } from "date-fns";
import { mockTemplates, mockCertificateRules } from '@/lib/mock-data';


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldCheck, FileWarning, ListChecks, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const buildSchema = (fields: FormTemplateField[] = []) => {
    const shape: { [key: string]: z.ZodType<any, any> } = {};

    fields.forEach(field => {
        let fieldSchema: z.ZodType<any, any>;

        switch (field.type) {
            case 'float':
                fieldSchema = z.string().refine(val => !field.required || val, `${field.label} is required.`).pipe(z.coerce.number({invalid_type_error: "Please enter a valid number."}));
                if (!field.required) {
                  fieldSchema = fieldSchema.optional().or(z.literal(''));
                }
                break;
            case 'select':
                fieldSchema = z.string();
                if (field.required) {
                    fieldSchema = fieldSchema.refine(val => val && val.length > 0, { message: `${field.label} is required.` });
                }
                break;
            case 'boolean':
                fieldSchema = z.boolean().default(false);
                break;
            case 'date':
                const dateSchema = z.date({
                    required_error: `${field.label} is required.`,
                    invalid_type_error: "That's not a valid date!",
                });
                fieldSchema = field.required ? dateSchema : dateSchema.nullable().optional();
                break;
            default: // 'text' and 'textarea'
                fieldSchema = z.string();
                if (field.required) {
                   fieldSchema = fieldSchema.refine(val => val && val.length > 0, { message: `${field.label} is required.` });
                }
        }
        shape[field.field_id] = fieldSchema;
    });

    return z.object(shape);
};

interface CompanyNewProductClientProps {
  industries: Industry[];
  categories: ProductCategory[];
}

export function CompanyNewProductClient({ industries, categories }: CompanyNewProductClientProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceCheckOutput | null>(null);

  const [templates] = useState<FormTemplate[]>(mockTemplates);

  const [selectedIndustryId, setSelectedIndustryId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [activeRules, setActiveRules] = useState<CertificateRule[]>([]);

  const filteredCategories = useMemo(() => {
    if (!selectedIndustryId) return [];
    return categories.filter(c => c.industry_id === selectedIndustryId && c.active);
  }, [selectedIndustryId, categories]);

  const activeTemplate = useMemo(() => {
    if (!selectedCategoryId) return null;
    const category = categories.find(c => c.category_id === selectedCategoryId);
    if (!category) return null;
    return templates.find(t => t.form_template_id === category.form_template_id && t.is_active) || null;
  }, [selectedCategoryId, categories, templates]);
  
  const form = useForm<z.infer<ReturnType<typeof buildSchema>>>({
    resolver: zodResolver(buildSchema(activeTemplate?.fields_schema)),
  });

  useEffect(() => {
    form.reset({});
    setSelectedCategoryId("");
    setComplianceResult(null);
    setActiveRules([]);
  }, [selectedIndustryId, form]);

  useEffect(() => {
    const defaultValues: {[key: string]: any} = {};
     if (activeTemplate) {
        activeTemplate.fields_schema.forEach(field => {
            if (field.type === 'boolean') defaultValues[field.field_id] = false;
            else if (field.type === 'float') defaultValues[field.field_id] = '';
            else if (field.type === 'date') defaultValues[field.field_id] = null;
            else defaultValues[field.field_id] = '';
        });
     }
    form.reset(defaultValues);
    setComplianceResult(null);
    
    // Auto-detect compliance rules
    if (selectedIndustryId && selectedCategoryId) {
        const relevantRules = mockCertificateRules.filter(rule => 
            rule.industry_id === selectedIndustryId &&
            (!rule.category_id || rule.category_id === selectedCategoryId) &&
            rule.active
        );
        setActiveRules(relevantRules);
    } else {
        setActiveRules([]);
    }

  }, [activeTemplate, selectedIndustryId, selectedCategoryId, form]);


  async function handleComplianceCheck(values: z.infer<ReturnType<typeof buildSchema>>) {
    setIsLoading(true);
    setComplianceResult(null);
    const industry = industries.find(i => i.industry_id === selectedIndustryId);
    if (!industry || !activeTemplate) {
      toast({ variant: "destructive", title: "Configuration Error", description: "Could not find industry or form template."});
      setIsLoading(false);
      return;
    }
    
    if (activeRules.length === 0) {
        toast({ variant: "destructive", title: "No rules found", description: "No compliance rules are configured for this product type. Cannot perform check." });
        setIsLoading(false);
        return;
    }

    const compiledRequirements = activeRules.map(rule => 
        `Rule: ${rule.certificate_type}. Description: ${rule.description}. Mandatory: ${rule.mandatory}.`
    ).join('\n');

    try {
      const productData = Object.entries(values)
        .map(([key, value]) => `${activeTemplate.fields_schema.find(f=>f.field_id === key)?.label || key}: ${value}`)
        .join(', ');
        
      const result = await complianceCheck({
        productData: productData,
        industry: industry.industry_name,
        regulatoryRequirements: compiledRequirements,
      });
      setComplianceResult(result);
      toast({ title: "Compliance Check Complete" });
    } catch (error) {
      console.error("Compliance check failed:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to run compliance check." });
    } finally {
      setIsLoading(false);
    }
  }

  function handleGenerateDpp() {
     toast({ title: "DPP Draft Saved!", description: "Your product draft has been saved." });
  }

  const renderField = (field: FormTemplateField) => (
    <FormField key={field.field_id} control={form.control} name={field.field_id}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          <FormControl>
            { (field.type === 'text' || field.type === 'float') ? <Input placeholder={field.placeholder} {...formField} value={formField.value ?? ''} type={field.type === 'float' ? 'number' : 'text'} />
            : field.type === 'textarea' ? <Textarea placeholder={field.placeholder} {...formField} />
            : field.type === 'boolean' ? <div className="flex h-10 items-center"><Switch id={field.field_id} checked={formField.value} onCheckedChange={formField.onChange} /></div>
            : field.type === 'date' ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formField.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formField.value ? format(formField.value, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formField.value}
                    onSelect={formField.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )
            : field.type === 'select' && field.options ? (
              <Select onValueChange={formField.onChange} value={formField.value || ""}>
                <SelectTrigger><SelectValue placeholder={field.placeholder || `Select a ${field.label.toLowerCase()}`} /></SelectTrigger>
                <SelectContent>{field.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            ) : <Input {...formField} />}
          </FormControl>
           {field.type === 'textarea' && field.placeholder?.includes('JSON') && (
            <FormDescription>Please provide a valid JSON string.</FormDescription>
          )}
           {field.type === 'textarea' && field.placeholder?.includes('comma-separated') && (
            <FormDescription>Please provide a comma-separated list of values.</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleComplianceCheck)} className="space-y-8">
            <Card>
              <CardHeader><CardTitle className="font-headline">1. Select Product Type</CardTitle></CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select onValueChange={setSelectedIndustryId} value={selectedIndustryId}>
                    <SelectTrigger><SelectValue placeholder="Select an industry..." /></SelectTrigger>
                    <SelectContent>{industries.map(i => <SelectItem key={i.industry_id} value={i.industry_id}>{i.industry_name}</SelectItem>)}</SelectContent>
                  </Select>
                </FormItem>
                <FormItem>
                  <FormLabel>Product Category</FormLabel>
                  <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId} disabled={!selectedIndustryId}>
                    <SelectTrigger><SelectValue placeholder="Select a category..." /></SelectTrigger>
                    <SelectContent>{filteredCategories.map(c => <SelectItem key={c.category_id} value={c.category_id}>{c.category_name}</SelectItem>)}</SelectContent>
                  </Select>
                </FormItem>
              </CardContent>
            </Card>

            {activeTemplate && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">2. Enter Product Metadata</CardTitle>
                    <CardDescription>Fill out the details for a "{activeTemplate.form_template_name}".</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-2">
                    {activeTemplate.fields_schema.map(renderField)}
                  </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">3. Review Compliance Context</CardTitle>
                        <CardDescription>The AI will check your data against these automatically detected rules for your selected product type.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeRules.length > 0 ? (
                            <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5">
                                {activeRules.map(rule => (
                                    <li key={rule.certificate_rule_id}>
                                        <span className="font-semibold text-foreground">{rule.certificate_type}:</span> {rule.description}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-sm text-muted-foreground">No specific compliance rules found for this product type. The AI will perform a general check.</p>
                        )}
                    </CardContent>
                </Card>
              </>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={isLoading || !activeTemplate} className="w-full sm:w-auto">
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</>
                ) : (
                    <><ListChecks className="mr-2 h-4 w-4" /> Check Compliance</>
                )}
                </Button>
                <Button type="button" variant="secondary" onClick={handleGenerateDpp} disabled={!complianceResult} className="w-full sm:w-auto">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Save as Draft
                </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline">Compliance Report</CardTitle>
            <CardDescription>Results from the AI analysis will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="font-semibold">AI is analyzing your data...</p>
              </div>
            )}
            {complianceResult ? (
              <div className="space-y-4">
                <Alert variant={complianceResult.complianceIssues.length > 0 ? "destructive" : "default"} className={complianceResult.complianceIssues.length === 0 ? "border-green-500 bg-green-50" : ""}>
                    {complianceResult.complianceIssues.length > 0 ? <FileWarning className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4 text-green-700" />}
                    <AlertTitle className={complianceResult.complianceIssues.length === 0 ? "text-green-800" : ""}>{complianceResult.complianceIssues.length > 0 ? `${complianceResult.complianceIssues.length} Issue(s) Found` : "No Issues Found"}</AlertTitle>
                    <AlertDescription className={complianceResult.complianceIssues.length === 0 ? "text-green-700" : ""}>{complianceResult.summary}</AlertDescription>
                </Alert>
                
                {complianceResult.complianceIssues.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Details:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-destructive">
                      {complianceResult.complianceIssues.map((issue, index) => <li key={index}>{issue}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ) : !isLoading && (
                <div className="text-center text-muted-foreground p-8">
                    <p>Select an industry and category to begin.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
