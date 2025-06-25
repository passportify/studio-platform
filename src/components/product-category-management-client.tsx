

"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Industry, ProductCategory, FormTemplate } from "@/lib/types";
import { mockIndustries, mockCategories, mockTemplates } from "@/lib/mock-data";

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
import { PlusCircle, MoreHorizontal, Pen, Trash2 } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


const categoryFormSchema = z.object({
  category_name: z.string().min(3, "Category name must be at least 3 characters."),
  industry_id: z.string({ required_error: "Please select an industry." }),
  category_code: z.string().optional(),
  description: z.string().optional(),
  form_template_id: z.string().min(1, "A form template must be selected."),
  requires_traceability: z.boolean(),
  requires_certificates: z.boolean(),
  active: z.boolean(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export function ProductCategoryManagementClient() {
  const { toast } = useToast();
  const [industries] = useState<Industry[]>(mockIndustries);
  const [categories, setCategories] = useState<ProductCategory[]>(mockCategories);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  const industryMap = useMemo(() => 
    new Map(industries.map(i => [i.industry_id, i.industry_name])),
    [industries]
  );

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      category_name: "",
      industry_id: "",
      category_code: "",
      description: "",
      form_template_id: "",
      requires_traceability: false,
      requires_certificates: true,
      active: true,
    },
  });

  const watchIndustryId = form.watch("industry_id");

  const availableTemplates = useMemo(() => {
    if (!watchIndustryId) return [];
    return mockTemplates.filter(t => t.industry_id === watchIndustryId);
  }, [watchIndustryId]);

  useEffect(() => {
    // Reset form template when industry changes to prevent invalid state
    if (form.getValues("industry_id") !== selectedCategory?.industry_id) {
       form.setValue('form_template_id', '');
    }
  }, [watchIndustryId, form, selectedCategory]);


  const handleAdd = () => {
    setSelectedCategory(null);
    form.reset({
      category_name: "",
      industry_id: "",
      category_code: "",
      description: "",
      form_template_id: "",
      requires_traceability: false,
      requires_certificates: true,
      active: true,
    });
    setIsFormDialogOpen(true);
  };

  const handleEdit = (category: ProductCategory) => {
    setSelectedCategory(category);
    form.reset(category);
    setIsFormDialogOpen(true);
  };

  const handleDeletePrompt = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedCategory) {
      setCategories(cats => cats.filter(c => c.category_id !== selectedCategory.category_id));
      toast({ title: "Category Deleted", description: `"${selectedCategory.category_name}" has been removed.` });
    }
    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  function onSubmit(data: CategoryFormData) {
    if (selectedCategory) {
      const updatedCategory: ProductCategory = { ...selectedCategory, ...data };
      setCategories(cats => cats.map(c => c.category_id === selectedCategory.category_id ? updatedCategory : c));
      toast({ title: "Category Updated" });
    } else {
      const newCategory: ProductCategory = {
        category_id: `cat_${Date.now()}`,
        ...data,
      };
      setCategories([newCategory, ...categories]);
      toast({ title: "Category Added" });
    }
    setIsFormDialogOpen(false);
    setSelectedCategory(null);
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Category List</CardTitle>
              <CardDescription>Product categories linked to industries.</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.category_id}>
                  <TableCell className="font-medium">{category.category_name}</TableCell>
                  <TableCell>{category.category_code}</TableCell>
                  <TableCell>{industryMap.get(category.industry_id) || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={category.active ? "default" : "secondary"}>
                      {category.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Options</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Pen className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePrompt(category)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
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
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedCategory ? "Edit" : "Add New"} Category</DialogTitle>
            <DialogDescription>Fill in the details for the product category.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="category_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl><Input placeholder="e.g., EV Battery" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category_code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Code</FormLabel>
                    <FormControl><Input placeholder="e.g., EVB" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="industry_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry.industry_id} value={industry.industry_id}>
                          {industry.industry_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe this category..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField
                control={form.control}
                name="form_template_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Template</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!watchIndustryId || availableTemplates.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a form template..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTemplates.map((template) => (
                          <SelectItem
                            key={template.form_template_id}
                            value={template.form_template_id}
                          >
                            {template.form_template_name} (v
                            {template.version})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {availableTemplates.length === 0 && watchIndustryId
                        ? "No templates found for this industry."
                        : "Link this category to a form template."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4 pt-2">
                <FormField control={form.control} name="requires_traceability" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <FormLabel>Requires Traceability</FormLabel>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="requires_certificates" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <FormLabel>Requires Certificates</FormLabel>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </div>
              
              <FormField control={form.control} name="active" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>Inactive categories won't be selectable.</FormDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />

              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">{selectedCategory ? "Save Changes" : "Create Category"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              "{selectedCategory?.category_name}" category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
