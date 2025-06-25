"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Industry } from "@/lib/types";
import { mockIndustries } from "@/lib/mock-data";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreHorizontal, Pen, Trash2 } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


const industryFormSchema = z.object({
  industry_name: z
    .string()
    .min(3, { message: "Industry name must be at least 3 characters." }),
  industry_code: z
    .string()
    .min(1, { message: "Industry code is required." }),
  description: z.string().optional(),
  regulatory_body: z.string().optional(),
  compliance_frameworks: z.string().optional(),
  active: z.boolean(),
});

type IndustryFormData = z.infer<typeof industryFormSchema>;

export function IndustryManagementClient() {
  const { toast } = useToast();
  const [industries, setIndustries] = useState<Industry[]>(mockIndustries);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(
    null
  );

  const form = useForm<IndustryFormData>({
    resolver: zodResolver(industryFormSchema),
    defaultValues: {
      industry_name: "",
      industry_code: "",
      description: "",
      regulatory_body: "",
      compliance_frameworks: "",
      active: true,
    },
  });

  const handleAdd = () => {
    setSelectedIndustry(null);
    form.reset({
      industry_name: "",
      industry_code: "",
      description: "",
      regulatory_body: "",
      compliance_frameworks: "",
      active: true,
    });
    setIsFormDialogOpen(true);
  };

  const handleEdit = (industry: Industry) => {
    setSelectedIndustry(industry);
    form.reset({
      ...industry,
      compliance_frameworks: industry.compliance_frameworks.join(", "),
    });
    setIsFormDialogOpen(true);
  };

  const handleDeletePrompt = (industry: Industry) => {
    setSelectedIndustry(industry);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedIndustry) {
      setIndustries(
        industries.filter(
          (ind) => ind.industry_id !== selectedIndustry.industry_id
        )
      );
      toast({ title: "Industry Deleted", description: `"${selectedIndustry.industry_name}" has been removed.` });
    }
    setIsDeleteDialogOpen(false);
    setSelectedIndustry(null);
  };

  function onSubmit(data: IndustryFormData) {
    const frameworks =
      data.compliance_frameworks
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];

    if (selectedIndustry) {
      const updatedIndustry: Industry = {
        ...selectedIndustry,
        ...data,
        compliance_frameworks: frameworks,
      };
      setIndustries(
        industries.map((ind) =>
          ind.industry_id === selectedIndustry.industry_id ? updatedIndustry : ind
        )
      );
      toast({ title: "Industry Updated" });
    } else {
      const newIndustry: Industry = {
        industry_id: Date.now().toString(),
        ...data,
        compliance_frameworks: frameworks,
      };
      setIndustries([newIndustry, ...industries]);
      toast({ title: "Industry Added" });
    }
    setIsFormDialogOpen(false);
    setSelectedIndustry(null);
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Industry Master List</CardTitle>
              <CardDescription>
                Centrally controlled list of industries and their compliance frameworks.
              </CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2" />
              Add Industry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Industry Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Compliance Frameworks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {industries.map((industry) => (
                <TableRow key={industry.industry_id}>
                  <TableCell className="font-medium">
                    {industry.industry_name}
                  </TableCell>
                  <TableCell>{industry.industry_code}</TableCell>
                  <TableCell>
                    <Badge variant={industry.active ? "default" : "secondary"}>
                      {industry.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {industry.compliance_frameworks.slice(0, 2).join(", ")}
                    {industry.compliance_frameworks.length > 2 && '...'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Options</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(industry)}>
                          <Pen className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePrompt(industry)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
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
            <DialogTitle className="font-headline">
              {selectedIndustry ? "Edit Industry" : "Add New Industry"}
            </DialogTitle>
            <DialogDescription>
              {selectedIndustry
                ? "Update the details for this industry."
                : "Add a new industry to the master list."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="industry_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Batteries" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="industry_code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., C.27.20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Explain the scope of this industry..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="regulatory_body" render={({ field }) => (
                <FormItem>
                  <FormLabel>Regulatory Body</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ECHA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="compliance_frameworks" render={({ field }) => (
                <FormItem>
                  <FormLabel>Compliance Frameworks</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., REACH, RoHS, WEEE" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a comma-separated list of frameworks.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="active" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Inactive industries will not be visible in product onboarding.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {selectedIndustry ? "Save Changes" : "Create Industry"}
                </Button>
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
              "{selectedIndustry?.industry_name}" industry.
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
