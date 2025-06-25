
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bug, LifeBuoy, Send } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';

const supportFormSchema = z.object({
  type: z.enum(['bug', 'ticket'], { required_error: 'Please select a type.' }),
  subject: z.string().min(5, 'Subject must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  attachment: z.any().optional().nullable(),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

export function SupportDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      type: 'bug',
      subject: '',
      description: '',
      attachment: null,
    },
  });

  const onSubmit = (data: SupportFormData) => {
    console.log('Support ticket submitted:', data);
    toast({
      title: 'Submission Received!',
      description: "Thanks for your feedback. Our team will get back to you shortly.",
    });
    setIsOpen(false);
    form.reset({
      type: 'bug',
      subject: '',
      description: '',
      attachment: null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit a Request</DialogTitle>
          <DialogDescription>
            Report a bug or ask a question. We're here to help.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a request type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bug">
                        <div className="flex items-center gap-2">
                          <Bug className="h-4 w-4" /> Bug Report
                        </div>
                      </SelectItem>
                      <SelectItem value="ticket">
                        <div className="flex items-center gap-2">
                          <LifeBuoy className="h-4 w-4" /> Support Ticket
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Logo not displaying on mobile" {...field} />
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
                    <Textarea
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attachment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachment (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" /> Submit Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
