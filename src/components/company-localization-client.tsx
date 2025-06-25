
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { CompanyLocalizationSettings } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { Checkbox } from "./ui/checkbox";

const localizationFormSchema = z.object({
  default_language: z.string().min(1, "Default language is required."),
  supported_languages: z.array(z.string()).min(1, "At least one supported language is required."),
  default_locale: z.string().min(1, "Default locale is required."),
  measurement_units: z.enum(['metric', 'imperial']),
  timezone: z.string().min(1, "Timezone is required."),
  auto_detect_from_browser: z.boolean(),
  allow_public_language_toggle: z.boolean(),
  ai_translation_mode: z.enum(['manual', 'auto-ai', 'disabled']),
});

type LocalizationFormData = z.infer<typeof localizationFormSchema>;

// Mock data for dropdowns
const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
];
const availableLocales = ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'es-ES'];
const availableTimezones = ['UTC', 'Europe/Berlin', 'America/New_York', 'Asia/Tokyo'];

interface CompanyLocalizationClientProps {
  initialData: CompanyLocalizationSettings;
}

export function CompanyLocalizationClient({ initialData }: CompanyLocalizationClientProps) {
  const { toast } = useToast();

  const form = useForm<LocalizationFormData>({
    resolver: zodResolver(localizationFormSchema),
    defaultValues: initialData,
  });

  function onSubmit(data: LocalizationFormData) {
    console.log("Saving localization settings:", data);
    toast({
      title: "Settings Saved",
      description: "Your localization preferences have been updated.",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                <CardTitle>Language & Locale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="default_language"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Default Language</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a language..." /></SelectTrigger></FormControl>
                        <SelectContent>
                            {availableLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="supported_languages"
                    render={({ field }) => (
                    <FormItem>
                         <FormLabel>Supported Languages</FormLabel>
                         <div className="space-y-2 rounded-md border p-4">
                            {availableLanguages.map((lang) => (
                                <FormField
                                key={lang.code}
                                control={form.control}
                                name="supported_languages"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={lang.code}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(lang.code)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...field.value, lang.code])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== lang.code
                                                    )
                                                )
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                         {lang.name}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                                />
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="default_locale"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Default Locale</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a locale..." /></SelectTrigger></FormControl>
                        <SelectContent>
                            {availableLocales.map(locale => <SelectItem key={locale} value={locale}>{locale}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </CardContent>
            </Card>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Units & Timezone</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="measurement_units"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Measurement Units</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex space-x-4"
                                    >
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="metric" /></FormControl><FormLabel className="font-normal">Metric</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="imperial" /></FormControl><FormLabel className="font-normal">Imperial</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="timezone"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Timezone</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a timezone..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {availableTimezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Advanced Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="auto_detect_from_browser"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <FormLabel>Auto-detect Locale</FormLabel>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="allow_public_language_toggle"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <FormLabel>Public Language Toggle</FormLabel>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="ai_translation_mode"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>AI Translation Mode</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="auto-ai">Auto-translate with AI</SelectItem>
                                    <SelectItem value="manual">Manual translation only</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
        <Button type="submit" className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" /> Save Preferences
        </Button>
      </form>
    </Form>
  );
}
