
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { CompanyBranding } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, ExternalLink } from "lucide-react";
import Image from "next/image";

const brandingFormSchema = z.object({
  brand_name: z.string().min(2, "Brand name is required."),
  logo_url: z.string().url("Please enter a valid URL for the logo."),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color."),
  secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color."),
  support_url: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  custom_footer_text: z.string().optional(),
});

type BrandingFormData = z.infer<typeof brandingFormSchema>;

interface CompanyBrandingClientProps {
  initialData: CompanyBranding;
}

export function CompanyBrandingClient({ initialData }: CompanyBrandingClientProps) {
  const { toast } = useToast();

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      brand_name: initialData.brand_name || "",
      logo_url: initialData.logo_url || "",
      primary_color: initialData.primary_color || "#000000",
      secondary_color: initialData.secondary_color || "#F1F3F5",
      support_url: initialData.support_url || "",
      custom_footer_text: initialData.custom_footer_text || "",
    },
  });

  const watchedData = form.watch();

  function onSubmit(data: BrandingFormData) {
    console.log("Saving branding data:", data);
    toast({
      title: "Branding Saved",
      description: "Your appearance settings have been updated.",
    });
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8 items-start">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="brand_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormDescription>Must be a direct link to an image file.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input type="color" className="w-12 h-10 p-1" {...field} />
                        <Input placeholder="#0055A4" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary/Background Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input type="color" className="w-12 h-10 p-1" {...field} />
                        <Input placeholder="#F1F3F5" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Custom Links & Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="support_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://support.yourcompany.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="custom_footer_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Footer Text</FormLabel>
                    <FormControl>
                      <Textarea placeholder="© 2024 Your Company. All Rights Reserved." {...field} />
                    </FormControl>
                     <FormDescription>This text will appear in the footer of public DPP pages.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" /> Save Branding Settings
          </Button>
        </form>
      </Form>
      
      <div className="lg:col-span-2 space-y-4 sticky top-24">
        <h3 className="text-lg font-semibold">Live Preview</h3>
        <Card
          style={{
            backgroundColor: watchedData.secondary_color || initialData.secondary_color,
          }}
          className="overflow-hidden transition-colors"
        >
          <CardHeader className="flex-row items-start gap-4">
            {watchedData.logo_url && (
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={watchedData.logo_url} alt={watchedData.brand_name} />
                <AvatarFallback>{watchedData.brand_name?.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <CardTitle>{watchedData.brand_name || "Your Brand Name"}</CardTitle>
              <CardDescription>Public DPP Preview</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full aspect-video bg-gray-300 rounded-md flex items-center justify-center">
              <Image data-ai-hint="product photo" src="https://placehold.co/600x400.png" width={300} height={200} alt="Product Placeholder"/>
            </div>
             <p className="font-semibold text-lg mt-4">Sample Product Title</p>
             <p className="text-sm text-muted-foreground">This is how your branding will appear on public pages.</p>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button
              style={{
                backgroundColor: watchedData.primary_color || initialData.primary_color,
              }}
              className="w-full text-white"
            >
              <ExternalLink className="mr-2 h-4 w-4" /> View Compliance Details
            </Button>
            {watchedData.custom_footer_text && <p className="text-xs text-muted-foreground w-full text-center pt-2 border-t">{watchedData.custom_footer_text}</p>}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
