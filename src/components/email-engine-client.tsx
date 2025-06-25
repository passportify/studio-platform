"use client";

import { Label } from '@/components/ui/label'
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { mockEmailTriggers, mockEmailTemplates } from "@/lib/mock-data";
import type { EmailTrigger, EmailTemplate } from "@/lib/types";
import { refineEmailTemplate } from "@/ai/flows/refine-email-template";
import { sendTestEmailAction } from "@/app/superadmin/email-engine/actions";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Pen, Save, Wand2, Loader2, Link as LinkIcon, Send, Rocket } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";


const templateFormSchema = z.object({
    template_id: z.string(),
    template_name: z.string().min(3, "Template name is required."),
    email_subject: z.string().min(5, "Subject is required."),
    email_body: z.string().min(20, "Body must be at least 20 characters."),
});
type TemplateFormData = z.infer<typeof templateFormSchema>;

const testEmailFormSchema = z.object({
  email: z.string().email("Please enter a valid email to send a test to."),
});
type TestEmailFormData = z.infer<typeof testEmailFormSchema>;

export function EmailEngineClient() {
  const { toast } = useToast();
  const [triggers, setTriggers] = useState<EmailTrigger[]>(mockEmailTriggers);
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const templateMap = useMemo(() => new Map(templates.map(t => [t.template_id, t.template_name])), [templates]);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
  });

  const testForm = useForm<TestEmailFormData>({
    resolver: zodResolver(testEmailFormSchema),
    defaultValues: {
        email: "",
    },
  });

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    form.reset(template);
    setIsFormOpen(true);
  };
  
  const handleTriggerToggle = (triggerId: string, enabled: boolean) => {
    setTriggers(prev => prev.map(t => t.trigger_id === triggerId ? { ...t, enabled } : t));
    toast({
        title: "Trigger Updated",
        description: `${triggers.find(t=>t.trigger_id === triggerId)?.trigger_name} has been ${enabled ? 'enabled' : 'disabled'}.`
    });
  };

  const handleTemplateSave = (data: TemplateFormData) => {
    setTemplates(prev => prev.map(t => t.template_id === data.template_id ? data : t));
    toast({ title: "Template Saved", description: `The "${data.template_name}" template has been updated.` });
    setIsFormOpen(false);
  };

  async function onSendTest(data: TestEmailFormData) {
    setIsSendingTest(true);
    try {
        const result = await sendTestEmailAction({ email: data.email });
        if (result.success) {
            toast({ title: "Test Email Sent!", description: `An email has been sent to ${data.email}.` });
        } else {
            throw new Error(result.error || 'An unknown error occurred.');
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Failed to Send", description: error.message });
    } finally {
        setIsSendingTest(false);
    }
}

  const handleAiRefine = async (instruction: string) => {
    const body = form.getValues('email_body');
    setIsAiLoading(true);
    try {
        const result = await refineEmailTemplate({ currentBody: body, instruction });
        form.setValue('email_body', result.refinedBody, { shouldValidate: true });
        toast({ title: "AI has refined the email body." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Could not refine the email with AI." });
    } finally {
        setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Send className="h-4 w-4" />
        <AlertTitle>Live Email Engine</AlertTitle>
        <AlertDescription>
          This interface is now connected to SendGrid. Changes to templates and triggers are saved to local state, but the Test Email feature will send a real email.
        </AlertDescription>
      </Alert>
      
      <Card>
          <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                  <Rocket className="text-primary"/> Send a Test Email
              </CardTitle>
              <CardDescription>
                  Confirm your SendGrid API key and configuration are working correctly by sending a test email.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Form {...testForm}>
                  <form onSubmit={testForm.handleSubmit(onSendTest)} className="flex items-start gap-2">
                      <FormField
                          control={testForm.control}
                          name="email"
                          render={({ field }) => (
                              <FormItem className="flex-1">
                                  <FormControl>
                                      <Input placeholder="Enter your email address..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <Button type="submit" disabled={isSendingTest}>
                          {isSendingTest ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                          {isSendingTest ? 'Sending...' : 'Send Test'}
                      </Button>
                  </form>
              </Form>
          </CardContent>
      </Card>


      <Tabs defaultValue="triggers">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="triggers">Email Triggers</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="triggers">
          <Card>
            <CardHeader>
              <CardTitle>Automated Email Triggers</CardTitle>
              <CardDescription>Enable or disable automated emails for specific platform events.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trigger Event</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Template Used</TableHead>
                    <TableHead className="text-right">Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {triggers.map(trigger => (
                    <TableRow key={trigger.trigger_id}>
                      <TableCell className="font-medium">{trigger.trigger_name}</TableCell>
                      <TableCell className="text-muted-foreground">{trigger.description}</TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => {
                          const template = templates.find(t => t.template_id === trigger.template_id);
                          if (template) {
                            handleEdit(template);
                          }
                        }}>
                           {templateMap.get(trigger.template_id)}
                           <LinkIcon className="ml-1 h-3 w-3"/>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch checked={trigger.enabled} onCheckedChange={(checked) => handleTriggerToggle(trigger.trigger_id, checked)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>View and edit the content of all automated emails.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Email Subject</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map(template => (
                    <TableRow key={template.template_id}>
                      <TableCell className="font-medium">{template.template_name}</TableCell>
                      <TableCell className="text-muted-foreground">{template.email_subject}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                          <Pen className="mr-2 h-4 w-4" /> Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleTemplateSave)}>
              <DialogHeader>
                <DialogTitle>Edit Template: {selectedTemplate?.template_name}</DialogTitle>
                <DialogDescription>
                    Modify the subject and body of this email. Use Handlebars syntax (like {"{{user.name}}"}) for dynamic values.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                  <ScrollArea className="max-h-[50vh] pr-4">
                    <div className="space-y-4">
                        <FormField control={form.control} name="email_subject" render={({ field }) => (
                            <FormItem><FormLabel>Email Subject</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email_body" render={({ field }) => (
                            <FormItem><FormLabel>Email Body (Markdown)</FormLabel><FormControl><Textarea rows={15} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                  </ScrollArea>
                   <div className="space-y-2 pt-4 border-t">
                        <Label>Improve with AI</Label>
                        <div className="flex flex-wrap gap-2">
                           <Button type="button" variant="outline" size="sm" onClick={() => handleAiRefine("Make the tone more formal.")} disabled={isAiLoading}>
                               <Wand2 className="mr-2 h-4 w-4"/> Make Formal
                           </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => handleAiRefine("Make the tone more friendly and approachable.")} disabled={isAiLoading}>
                               <Wand2 className="mr-2 h-4 w-4"/> Make Friendly
                           </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => handleAiRefine("Add a sense of urgency.")} disabled={isAiLoading}>
                               <Wand2 className="mr-2 h-4 w-4"/> Add Urgency
                           </Button>
                           <Button type="button" variant="outline" size="sm" onClick={() => handleAiRefine("Simplify the language.")} disabled={isAiLoading}>
                               <Wand2 className="mr-2 h-4 w-4"/> Simplify
                           </Button>
                           <Button type="button" variant="outline" size="sm" onClick={() => handleAiRefine("Shorten the content while keeping the core message.")} disabled={isAiLoading}>
                               <Wand2 className="mr-2 h-4 w-4"/> Shorten
                           </Button>
                        </div>
                    </div>
              </div>
              <DialogFooter className="pt-4">
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isAiLoading}>
                    {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />} 
                    Save Template
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
