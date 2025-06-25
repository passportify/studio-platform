
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import type { MaterialSpecification, MaterialDocument } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, PlusCircle, Paperclip, Trash2 } from "lucide-react";
import { mockMaterialDocuments } from "@/lib/mock-data";

const materialFormSchema = z.object({
  material_name: z.string().min(3, "Material name is required."),
  material_code: z.string().optional(),
  material_type: z.enum(['Raw', 'Subcomponent', 'Assembly', 'Additive']),
  description: z.string().min(10, "A brief description is required."),
  specifications: z.array(z.object({
      key: z.string().min(1, "Key cannot be empty."),
      value: z.string().min(1, "Value cannot be empty."),
  })),
});

type MaterialFormData = z.infer<typeof materialFormSchema>;

export function SupplierMaterialFormClient({ material }: { material?: MaterialSpecification }) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<MaterialDocument[]>(material ? mockMaterialDocuments.filter(d => d.material_id === material.material_id) : []);

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      material_name: material?.material_name || "",
      material_code: material?.material_code || "",
      material_type: material?.material_type || "Raw",
      description: material?.description || "",
      specifications: material ? Object.entries(material.specifications).map(([key, value]) => ({ key, value: String(value) })) : [{ key: "purity", value: "99.8%" }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "specifications"
  });

  function onSubmit(data: MaterialFormData) {
    const finalSpecifications = data.specifications.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
    }, {} as Record<string, any>);

    console.log({ ...data, specifications: finalSpecifications });
    toast({
      title: material ? "Material Updated" : "Material Created",
      description: `The specification for "${data.material_name}" has been saved.`,
    });
  }

  function handleAddDocument() {
    const newDoc: MaterialDocument = {
        document_id: `doc_mat_${Date.now()}`,
        material_id: material?.material_id || "new_material",
        document_name: "new_document.pdf",
        document_type: "Other",
        file_url: "#",
        upload_date: new Date().toISOString(),
    };
    setDocuments(prev => [...prev, newDoc]);
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/supplier-portal/my-materials">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Link>
        </Button>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            {material ? "Edit Material" : "Create New Material"}
          </h1>
          <p className="text-muted-foreground">
            {material ? "Update the specification for this material." : "Define a new material in your library."}
          </p>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Material Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="material_name" render={({ field }) => (
                            <FormItem><FormLabel>Material Name</FormLabel><FormControl><Input placeholder="e.g., High-Purity Cobalt" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="material_code" render={({ field }) => (
                                <FormItem><FormLabel>Material Code / SKU</FormLabel><FormControl><Input placeholder="Internal code" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="material_type" render={({ field }) => (
                                <FormItem><FormLabel>Material Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Raw">Raw</SelectItem>
                                        <SelectItem value="Subcomponent">Subcomponent</SelectItem>
                                        <SelectItem value="Assembly">Assembly</SelectItem>
                                        <SelectItem value="Additive">Additive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A brief description of the material..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="space-y-2">
                            <FormLabel>Technical Specifications</FormLabel>
                             <div className="space-y-4 rounded-md border p-4">
                                {fields.map((item, index) => (
                                    <div key={item.id} className="flex items-start gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`specifications.${index}.key`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1"><FormControl><Input placeholder="e.g., Purity" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`specifications.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1"><FormControl><Input placeholder="e.g., 99.8%" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}
                                        />
                                        <Button type="button" variant="destructive" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" size="sm" variant="outline" onClick={() => append({ key: '', value: '' })}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Specification
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    {material ? "Save Changes" : "Create Material"}
                </Button>
            </form>
        </Form>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Compliance Documents</CardTitle>
                            <CardDescription>Certificates and data sheets for this material.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleAddDocument} disabled={!material}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Upload
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Document Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.length > 0 ? documents.map(doc => (
                                <TableRow key={doc.document_id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                       <Paperclip className="h-4 w-4 text-muted-foreground" /> {doc.document_name}
                                    </TableCell>
                                    <TableCell>{doc.document_type}</TableCell>
                                    <TableCell>{doc.expiry_date ? format(new Date(doc.expiry_date), "PPP") : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        {material ? "No documents uploaded." : "Save the material before adding documents."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
