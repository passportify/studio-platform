
"use client";

import { useState } from "react";
import { useForm, useFieldArray, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { CountryPack } from "@/lib/types";
import { mockCountryPacks } from "@/lib/mock-data";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreHorizontal, Pen, Trash2, Globe } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const translationSchema = z.object({
    key: z.string().min(1, "Key cannot be empty."),
    value: z.string().min(1, "Value cannot be empty."),
});

const customFieldSchema = z.object({
    key: z.string().min(1, "Key is required."),
    label: z.string().min(1, "Label is required."),
    type: z.enum(['text', 'number', 'boolean']),
});

const packFormSchema = z.object({
  language_code: z.string().min(2, "Language code is required.").max(5),
  country_code: z.string().length(2, "Must be a 2-letter country code.").toUpperCase(),
  region_profile: z.string().min(2, "Region profile is required."),
  translated_field_labels: z.array(translationSchema),
  translated_static_content: z.array(translationSchema),
  custom_regulatory_fields: z.array(customFieldSchema).optional(),
  epr_mandates_applicable: z.boolean(),
  default_currency: z.string().length(3, "Must be a 3-letter currency code.").toUpperCase(),
  rtl_layout_required: z.boolean(),
  active: z.boolean(),
});

type PackFormData = z.infer<typeof packFormSchema>;

const KeyValueEditor = ({ name, label }: { name: `translated_field_labels` | `translated_static_content`, label: string }) => {
    const { control } = useFormContext<PackFormData>();
    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    return (
        <div>
            <FormLabel>{label}</FormLabel>
            <div className="space-y-2 mt-2 p-4 border rounded-md">
                {fields.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-2">
                        <FormField
                            control={control}
                            name={`${name}.${index}.key`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl><Input placeholder="Key" {...field} className="font-mono text-xs"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`${name}.${index}.value`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl><Input placeholder="Value" {...field} className="font-mono text-xs" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="shrink-0">
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Remove Translation</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ key: "", value: "" })}
                >
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Translation
                </Button>
            </div>
        </div>
    )
}

const CustomFieldEditor = () => {
    const { control } = useFormContext<PackFormData>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'custom_regulatory_fields',
    });

    return (
        <div className="space-y-2">
            <FormLabel>Custom Regulatory Fields</FormLabel>
            <FormDescription>Define extra fields required for this country.</FormDescription>
            <div className="space-y-2 mt-2 p-4 border rounded-md">
                {fields.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] items-start gap-2">
                        <FormField
                            control={control}
                            name={`custom_regulatory_fields.${index}.key`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl><Input placeholder="Field Key (e.g., repair_index)" {...field} className="font-mono text-xs"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`custom_regulatory_fields.${index}.label`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl><Input placeholder="Label (e.g., Repair Index)" {...field} className="text-xs" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`custom_regulatory_fields.${index}.type`}
                            render={({ field }) => (
                                <FormItem>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="text-xs"><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="boolean">Boolean</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="shrink-0">
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Remove Field</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ key: "", label: "", type: "text" })}
                >
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Custom Field
                </Button>
            </div>
        </div>
    )
}

export function CountryPackManagementClient() {
  const { toast } = useToast();
  const [packs, setPacks] = useState<CountryPack[]>(mockCountryPacks);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<CountryPack | null>(null);

  const form = useForm<PackFormData>({
    resolver: zodResolver(packFormSchema),
    defaultValues: {
      language_code: "", country_code: "", region_profile: "",
      translated_field_labels: [], translated_static_content: [],
      custom_regulatory_fields: [], epr_mandates_applicable: false,
      default_currency: "", rtl_layout_required: false, active: true,
    },
  });

  const handleAdd = () => {
    setSelectedPack(null);
    form.reset({
      language_code: "", country_code: "", region_profile: "",
      translated_field_labels: [{ key: "product_name", value: "Produktname" }], 
      translated_static_content: [{ key: "faq_title", value: "Häufig gestellte Fragen" }],
      custom_regulatory_fields: [], epr_mandates_applicable: false,
      default_currency: "", rtl_layout_required: false, active: true,
    });
    setIsFormDialogOpen(true);
  };

  const handleEdit = (pack: CountryPack) => {
    setSelectedPack(pack);
    form.reset({
      ...pack,
      translated_field_labels: Object.entries(pack.translated_field_labels).map(([key, value]) => ({ key, value })),
      translated_static_content: Object.entries(pack.translated_static_content).map(([key, value]) => ({ key, value })),
      custom_regulatory_fields: pack.custom_regulatory_fields ? Object.entries(pack.custom_regulatory_fields).map(([key, value]) => ({ key, ...value })) : [],
    });
    setIsFormDialogOpen(true);
  };

  const handleDeletePrompt = (pack: CountryPack) => {
    setSelectedPack(pack);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedPack) {
      setPacks(packs.filter(p => p.pack_id !== selectedPack.pack_id));
      toast({ title: "Pack Deleted", description: `The pack for ${selectedPack.country_code} (${selectedPack.language_code}) has been removed.` });
    }
    setIsDeleteDialogOpen(false);
    setSelectedPack(null);
  };

  function onSubmit(data: PackFormData) {
    const arrayToRecord = (arr: {key: string, value: string}[]) => arr.reduce((acc, {key, value}) => {
        if(key) acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    const customFieldsToRecord = (arr: { key: string, label: string, type: 'text' | 'number' | 'boolean' }[] | undefined) => {
      if (!arr) return undefined;
      return arr.reduce((acc, { key, label, type }) => {
        if (key) acc[key] = { label, type };
        return acc;
      }, {} as Record<string, any>);
    };

    const newPack: CountryPack = {
      pack_id: selectedPack?.pack_id || `pack_${Date.now()}`,
      language_code: data.language_code,
      country_code: data.country_code,
      region_profile: data.region_profile,
      translated_field_labels: arrayToRecord(data.translated_field_labels),
      translated_static_content: arrayToRecord(data.translated_static_content),
      custom_regulatory_fields: customFieldsToRecord(data.custom_regulatory_fields),
      epr_mandates_applicable: data.epr_mandates_applicable,
      default_currency: data.default_currency,
      rtl_layout_required: data.rtl_layout_required,
      active: data.active,
    };

    if (selectedPack) {
      setPacks(packs.map(p => p.pack_id === selectedPack.pack_id ? newPack : p));
      toast({ title: "Pack Updated" });
    } else {
      setPacks([newPack, ...packs]);
      toast({ title: "Pack Added" });
    }
    setIsFormDialogOpen(false);
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline">Available Country Packs</CardTitle>
            <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add Pack</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country / Language</TableHead>
                <TableHead>Region Profile</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packs.map((pack) => (
                <TableRow key={pack.pack_id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{pack.country_code} ({pack.language_code})</span>
                    </div>
                  </TableCell>
                  <TableCell>{pack.region_profile}</TableCell>
                  <TableCell>{pack.default_currency}</TableCell>
                  <TableCell>
                    <Badge variant={pack.active ? "default" : "secondary"}>
                      {pack.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                       <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Options</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(pack)}><Pen className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePrompt(pack)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedPack ? "Edit" : "Add New"} Country Pack</DialogTitle>
            <DialogDescription>Define the localization and compliance rules for a specific country.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={form.control} name="country_code" render={({ field }) => (
                  <FormItem><FormLabel>Country Code</FormLabel><FormControl><Input placeholder="DE" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="language_code" render={({ field }) => (
                  <FormItem><FormLabel>Language Code</FormLabel><FormControl><Input placeholder="de" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="default_currency" render={({ field }) => (
                  <FormItem><FormLabel>Currency Code</FormLabel><FormControl><Input placeholder="EUR" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="region_profile" render={({ field }) => (
                <FormItem><FormLabel>Region Profile</FormLabel><FormControl><Input placeholder="EU_CENTRAL" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KeyValueEditor name="translated_field_labels" label="Field Label Translations"/>
                <KeyValueEditor name="translated_static_content" label="Static UI Translations"/>
              </div>
              <CustomFieldEditor />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="epr_mandates_applicable" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>EPR Mandates</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
                 <FormField control={form.control} name="rtl_layout_required" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>RTL Layout</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
                 <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
              </div>
              <DialogFooter className="pt-4">
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">{selectedPack ? "Save Changes" : "Create Pack"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the country pack for {selectedPack?.country_code}.</AlertDialogDescription>
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
