"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { sendNotificationAction } from "@/app/superadmin/send-notification/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2 } from "lucide-react";
import { useState } from "react";

const sendNotificationSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    link: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
    audience: z.enum(['all', 'suppliers', 'manufacturers', 'verifiers']),
});

type SendNotificationInput = z.infer<typeof sendNotificationSchema>;

export function SendNotificationClient() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const form = useForm<SendNotificationInput>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      audience: "all",
    },
  });

  async function onSubmit(data: SendNotificationInput) {
    setIsSending(true);
    try {
      const result = await sendNotificationAction(data);
      if (result.success) {
        toast({
          title: "Notification Sent!",
          description: `Your notification "${data.title}" has been broadcast to the selected audience.`,
        });
        form.reset();
      } else {
        throw new Error(result.error || "An unknown error occurred.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Send",
        description: error.message,
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Compose Notification</CardTitle>
            <CardDescription>This message will be sent to the bell icon of the target users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., System Maintenance Scheduled" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Please be advised that the platform will be down for maintenance..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/status" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an audience..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="suppliers">All Suppliers</SelectItem>
                      <SelectItem value="manufacturers">All Manufacturers & Brand Owners</SelectItem>
                      <SelectItem value="verifiers">All Verifiers</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="submit" disabled={isSending} className="w-full">
              {isSending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                  <><Send className="mr-2 h-4 w-4" /> Send Notification</>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground pt-2">Note: In this prototype, notifications are logged to the console and are not dynamically delivered to the bell icon.</p>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
