
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { generateCampaignEmail } from "@/ai/flows/generate-campaign-email";
import { mockCampaigns } from "@/lib/mock-data";
import type { Campaign, CampaignStatus } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreHorizontal, Send, Trash2, Wand2, Loader2 } from "lucide-react";

const campaignFormSchema = z.object({
  name: z.string().min(5, "Campaign name is required."),
  targetAudience: z.string({ required_error: "Please select a target audience." }),
  campaignObjective: z.string().min(10, "Please describe the campaign objective.").optional(),
  emailSubject: z.string().min(5, "Email subject is required."),
  emailBody: z.string().min(20, "Email body is required."),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

export function CompanyCampaignManagerClient() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      targetAudience: "",
      campaignObjective: "",
      emailSubject: "",
      emailBody: "",
    },
  });

  const handleGenerateEmail = async () => {
      const objective = form.getValues("campaignObjective");
      if (!objective || objective.length < 10) {
          form.setError("campaignObjective", { message: "Please provide a more detailed objective." });
          return;
      }
      setIsGenerating(true);
      try {
          const result = await generateCampaignEmail({
              campaignObjective: objective,
              companyName: "UltraCell GmbH", // Mock company name
          });
          form.setValue("emailSubject", result.subject);
          form.setValue("emailBody", result.body);
          toast({ title: "Email content generated!", description: "Review the generated content below." });
      } catch (error) {
          console.error(error);
          toast({ variant: "destructive", title: "Generation failed", description: "Could not generate email content." });
      } finally {
          setIsGenerating(false);
      }
  };
  
  const onSubmit = (data: CampaignFormData) => {
    const newCampaign: Campaign = {
        id: `camp_${Date.now()}`,
        name: data.name,
        status: "Sent",
        targetAudience: data.targetAudience,
        sentDate: new Date().toISOString(),
        createdBy: "Alice Johnson", // Mock user
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    toast({ title: "Campaign Sent!", description: `The campaign "${data.name}" has been sent.` });
    setIsFormOpen(false);
    form.reset();
  };

  const statusConfig: Record<CampaignStatus, { variant: "default" | "secondary" | "destructive" }> = {
    Sent: { variant: "default" },
    Draft: { variant: "secondary" },
    Scheduled: { variant: "secondary" },
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Campaigns</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.targetAudience}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[campaign.status].variant}>{campaign.status}</Badge>
                  </TableCell>
                  <TableCell>{campaign.sentDate ? format(new Date(campaign.sentDate), "PPP") : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Create New Campaign</DialogTitle>
            <DialogDescription>Design an email campaign to request data from your suppliers.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Campaign Name</FormLabel><FormControl><Input placeholder="e.g., Q3 Battery Data Drive" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="targetAudience" render={({ field }) => (
                <FormItem><FormLabel>Target Audience</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a supplier group..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="All Active Suppliers">All Active Suppliers</SelectItem>
                      <SelectItem value="Tier 1 Battery Suppliers">Tier 1 Battery Suppliers</SelectItem>
                      <SelectItem value="Suppliers with expiring documents">Suppliers with expiring documents</SelectItem>
                      <SelectItem value="Suppliers missing REACH certs">Suppliers missing REACH certs</SelectItem>
                    </SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />

              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-4">
                  <FormField control={form.control} name="campaignObjective" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Objective</FormLabel>
                      <FormControl><Textarea placeholder="e.g., Request updated REACH certificates for all cobalt suppliers due by end of month." {...field} /></FormControl>
                      <FormDescription>Describe the goal and the AI will generate the email content.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="button" variant="secondary" onClick={handleGenerateEmail} disabled={isGenerating} className="w-full">
                    {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate with AI</>}
                  </Button>
                </CardContent>
               </Card>

               <FormField control={form.control} name="emailSubject" render={({ field }) => (
                <FormItem><FormLabel>Email Subject</FormLabel><FormControl><Input placeholder="Generated by AI..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="emailBody" render={({ field }) => (
                <FormItem><FormLabel>Email Body</FormLabel><FormControl><Textarea {...field} rows={10} placeholder="Generated by AI..."/></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline">Save as Draft</Button>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">
                  <Send className="mr-2 h-4 w-4" /> Send Campaign
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
