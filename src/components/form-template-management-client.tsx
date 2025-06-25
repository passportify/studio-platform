
"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Industry, ProductCategory, FormTemplate, FormTemplateField } from "@/lib/types";
import { mockIndustries, mockCategories, mockTemplates } from "@/lib/mock-data";
import { generateFormTemplate } from "@/ai/flows/generate-form-template";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreHorizontal, Pen, Trash2, Loader2, Wand2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";


const fieldSchema = z.object({
  field_id: z.string().min(1, "Field ID is required.").regex(/^[a-z0-9_]+$/, "ID must be lowercase with underscores only."),
  label: z.string().min(1, "Label is required."),
  type: z.enum(['text', 'float', 'select', 'boolean', 'textarea', 'date']),
  required: z.boolean(),
  placeholder: z.string().optional(),
  options: z.array(z.object({ value: z.string().min(1, "Option cannot be empty.") })).optional(),
});

const templateFormSchema = z.object({
  form_template_name: z.string().min(3, "Template name is too short."),
  version: z.string().min(1, "Version is required."),
  version_type: z.enum(['product', 'material', 'certificate', 'traceability']),
  industry_id: z.string({ required_error: "Please select an industry." }),
  category_id: z.string({ required_error: "Please select a category." }),
  fields_schema: z.array(fieldSchema).min(1, "At least one field is required in the schema."),
  is_active: z.boolean(),
  is_master_template: z.boolean(),
  notes: z.string().optional(),
  effective_date: z.date().optional(),
});


type TemplateFormData = z.infer<typeof templateFormSchema>;

export function FormTemplateManagementClient() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<FormTemplate[]>(mockTemplates);
  const [industries] = useState<Industry[]>(mockIndustries);
  const [categories] = useState<ProductCategory[]>(mockCategories);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  const industryMap = useMemo(() => new Map(industries.map(i => [i.industry_id, i.industry_name])), [industries]);
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.category_id, c.category_name])), [categories]);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      form_template_name: "", version: "", industry_id: "", category_id: "",
      version_type: "product", fields_schema: [], is_active: true, is_master_template: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields_schema"
  });

  const watchIndustryId = form.watch("industry_id");
  const watchCategoryId = form.watch("category_id");
  const filteredCategories = useMemo(() => categories.filter(c => c.industry_id === watchIndustryId), [watchIndustryId, categories]);

  useEffect(() => {
    form.setValue('category_id', '');
  }, [watchIndustryId, form]);

  const handleAdd = () => {
    setSelectedTemplate(null);
    form.reset({
      form_template_name: "", version: "1.0", industry_id: "", category_id: "",
      version_type: "product", 
      fields_schema: [],
      is_active: true, is_master_template: false,
      notes: "",
    });
    setIsFormDialogOpen(true);
  };

  const handleEdit = (template: FormTemplate) => {
    setSelectedTemplate(template);
    form.reset({
      ...template,
      fields_schema: template.fields_schema.map(field => ({
        ...field,
        options: field.options?.map(o => ({ value: o }))
      })),
      effective_date: template.effective_date ? new Date(template.effective_date) : undefined,
    });
    setIsFormDialogOpen(true);
  };

  const handleDeletePrompt = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedTemplate) {
      setTemplates(temps => temps.filter(t => t.form_template_id !== selectedTemplate.form_template_id));
      toast({ title: "Template Deleted", description: `"${selectedTemplate.form_template_name}" has been removed.` });
    }
    setIsDeleteDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleGenerateSchema = async () => {
    const industryId = form.getValues("industry_id");
    const categoryId = form.getValues("category_id");
    
    if (!industryId || !categoryId) {
        toast({
            variant: "destructive",
            title: "Selection Required",
            description: "Please select an industry and a category first.",
        });
        return;
    }

    setIsGenerating(true);
    try {
        const industry = industries.find(i => i.industry_id === industryId);
        const category = categories.find(c => c.category_id === categoryId);
        
        if (!industry || !category) {
            throw new Error("Could not find selected industry or category.");
        }

        const result = await generateFormTemplate({
            industryName: industry.industry_name,
            categoryName: category.category_name,
        });
        
        const formattedFields = result.fields_schema.map(field => ({
            ...field,
            options: field.options?.map(opt => ({ value: opt })) || []
        }));
        
        form.setValue('fields_schema', formattedFields);

        toast({ title: "Schema Generated", description: "Review the AI-generated fields below." });
    } catch (error) {
        console.error("Schema generation failed:", error);
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "Could not generate the schema. Please try again.",
        });
    } finally {
        setIsGenerating(false);
    }
};

  function onSubmit(data: TemplateFormData) {
    const processedSchema = data.fields_schema.map(field => {
      const finalField: FormTemplateField = {
          field_id: field.field_id,
          label: field.label,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
      };
      if (field.type === 'select' && field.options) {
        finalField.options = field.options.map(opt => opt.value);
      }
      return finalField;
    });

    const newTemplate: FormTemplate = {
      form_template_id: selectedTemplate?.form_template_id || `form_${Date.now()}`,
      ...data,
      effective_date: data.effective_date?.toISOString(),
      fields_schema: processedSchema,
      created_by: 'Admin'
    };

    if (selectedTemplate) {
      setTemplates(temps => temps.map(t => t.form_template_id === selectedTemplate.form_template_id ? newTemplate : t));
      toast({ title: "Schema Updated" });
    } else {
      setTemplates([newTemplate, ...templates]);
      toast({ title: "Schema Added" });
    }
    setIsFormDialogOpen(false);
    setSelectedTemplate(null);
  }
  
  const FieldOptions = ({ nestIndex }: { nestIndex: number }) => {
    const { fields, remove, append } = useFieldArray({
      control: form.control,
      name: `fields_schema.${nestIndex}.options`
    });

    return (
        <div className="mt-4 pl-4 border-l-2">
            <FormLabel>Options</FormLabel>
            <div className="space-y-2 mt-2">
                {fields.map((item, k) => (
                    <div key={item.id} className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name={`fields_schema.${nestIndex}.options.${k}.value`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl><Input placeholder={`Option ${k + 1}`} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="destructive" size="sm" onClick={() => remove(k)}>Remove</Button>
                    </div>
                ))}
            </div>
             <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ value: "" })}
            >
                Add Option
            </Button>
        </div>
    );
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Schema List</CardTitle>
              <CardDescription>All available schemas for data collection.</CardDescription>
            </div>
            <Button onClick={handleAdd}><PlusCircle className="mr-2" /> Add Schema</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Schema Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.form_template_id}>
                  <TableCell className="font-medium">{template.form_template_name}</TableCell>
                  <TableCell className="capitalize">{template.version_type}</TableCell>
                  <TableCell>{categoryMap.get(template.category_id) || "N/A"}</TableCell>
                  <TableCell>{template.version}</TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(template)}><Pen className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePrompt(template)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedTemplate ? "Edit" : "Add New"} Schema</DialogTitle>
            <DialogDescription>Define the fields for a specific product data schema.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[80vh]">
              <ScrollArea className="h-[calc(80vh-250px)] pr-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="form_template_name" render={({ field }) => (
                      <FormItem><FormLabel>Schema Name</FormLabel><FormControl><Input placeholder="e.g., EV Battery Schema" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="version" render={({ field }) => (
                      <FormItem><FormLabel>Version</FormLabel><FormControl><Input placeholder="e.g., 1.0" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Generate Schema with AI</CardTitle>
                        <CardDescription>Select an industry and category, then let AI create a starting schema for you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                <FormLabel>Product Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!watchIndustryId}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                <SelectContent>{filteredCategories.map(c => <SelectItem key={c.category_id} value={c.category_id}>{c.category_name}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                            )} />
                        </div>
                        <Button type="button" onClick={handleGenerateSchema} disabled={isGenerating || !watchIndustryId || !watchCategoryId} className="w-full">
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            {isGenerating ? 'Generating...' : 'Generate Schema'}
                        </Button>
                    </CardContent>
                  </Card>

                  <div>
                      <FormLabel>Fields Schema</FormLabel>
                      <FormDescription>Review, edit, add, or remove fields generated by the AI.</FormDescription>
                      <div className="space-y-4 pt-2">
                        {fields.map((item, index) => (
                          <Card key={item.id} className="p-4 relative bg-background">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`fields_schema.${index}.field_id`} render={({ field }) => (
                                    <FormItem><FormLabel>Field ID</FormLabel><FormControl><Input placeholder="e.g., product_name" {...field}/></FormControl><FormMessage/></FormItem>
                                )}/>
                                <FormField control={form.control} name={`fields_schema.${index}.label`} render={({ field }) => (
                                    <FormItem><FormLabel>Label</FormLabel><FormControl><Input placeholder="e.g., Product Name" {...field}/></FormControl><FormMessage/></FormItem>
                                )}/>
                                <FormField control={form.control} name={`fields_schema.${index}.type`} render={({ field }) => (
                                    <FormItem><FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="textarea">Textarea</SelectItem>
                                            <SelectItem value="float">Number</SelectItem>
                                            <SelectItem value="boolean">Boolean (Switch)</SelectItem>
                                            <SelectItem value="date">Date</SelectItem>
                                            <SelectItem value="select">Select</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/></FormItem>
                                )}/>
                                <FormField control={form.control} name={`fields_schema.${index}.placeholder`} render={({ field }) => (
                                    <FormItem><FormLabel>Placeholder</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                                )}/>
                            </div>
                            {form.watch(`fields_schema.${index}.type`) === 'select' && (
                               <FieldOptions nestIndex={index} />
                            )}
                             <div className="flex items-center space-x-4 mt-4">
                                <FormField control={form.control} name={`fields_schema.${index}.required`} render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl><FormLabel className="!mt-0">Required</FormLabel></FormItem>
                                )}/>
                            </div>
                             <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove field</span>
                             </Button>
                          </Card>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => append({ field_id: '', label: '', type: 'text', required: false, placeholder: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Field Manually
                         </Button>
                      </div>
                  </div>
                  
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Internal notes about this schema version..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="is_active" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="is_master_template" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Master Template</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4 border-t">
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">{selectedTemplate ? "Save Changes" : "Create Schema"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the "{selectedTemplate?.form_template_name}" schema.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
