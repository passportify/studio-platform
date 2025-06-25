
"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import type { SupportTicket } from "@/lib/types";
import { mockSupportTickets } from "@/lib/mock-data";

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
import { Eye, Bug, LifeBuoy, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const ticketFormSchema = z.object({
  status: z.enum(["Open", "In Progress", "Resolved", "Closed"]),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  admin_notes: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

type TicketStatus = SupportTicket['status'];
type TicketPriority = SupportTicket['priority'];

const statusConfig: Record<TicketStatus, { variant: "default" | "secondary" | "destructive" }> = {
  "Open": { variant: "default" },
  "In Progress": { variant: "secondary" },
  "Resolved": { variant: "secondary" },
  "Closed": { variant: "destructive" },
};

const priorityConfig: Record<TicketPriority, { variant: "default" | "secondary" | "destructive" }> = {
  "Low": { variant: "secondary" },
  "Medium": { variant: "secondary" },
  "High": { variant: "default" },
  "Critical": { variant: "destructive" },
};

export function SupportTicketManagementClient() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>(mockSupportTickets);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
  });
  
  const handleEdit = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    form.reset({
      status: ticket.status,
      priority: ticket.priority,
      admin_notes: ticket.admin_notes || "",
    });
    setIsFormOpen(true);
  };

  const onSubmit = (data: TicketFormData) => {
    if (!selectedTicket) return;
    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      ...data,
      last_updated_at: new Date().toISOString(),
    };
    setTickets(tickets.map(t => (t.ticket_id === updatedTicket.ticket_id ? updatedTicket : t)));
    toast({ title: "Ticket Updated", description: `Ticket #${selectedTicket.ticket_id.slice(-6)} has been updated.` });
    setIsFormOpen(false);
    setSelectedTicket(null);
  };

  const filteredTickets = (status: 'open' | 'closed') => {
      if (status === 'open') {
          return tickets.filter(t => t.status === 'Open' || t.status === 'In Progress');
      }
      return tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
  }

  const renderTable = (data: SupportTicket[]) => (
     <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? data.map(ticket => (
          <TableRow key={ticket.ticket_id}>
            <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                    {ticket.type === 'bug' ? <Bug className="h-4 w-4 text-destructive"/> : <LifeBuoy className="h-4 w-4 text-primary"/>}
                    {ticket.subject}
                </div>
            </TableCell>
            <TableCell>{ticket.submitted_by_company}</TableCell>
            <TableCell><Badge variant={statusConfig[ticket.status].variant}>{ticket.status}</Badge></TableCell>
            <TableCell><Badge variant={priorityConfig[ticket.priority].variant}>{ticket.priority}</Badge></TableCell>
            <TableCell>{format(new Date(ticket.last_updated_at), "PPP")}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(ticket)}>
                <Eye className="mr-2 h-4 w-4" /> View / Edit
              </Button>
            </TableCell>
          </TableRow>
        )) : (
            <TableRow>
                <TableCell colSpan={6} className="text-center h-24">No tickets in this view.</TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
    <Tabs defaultValue="open">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="open">Open & In Progress</TabsTrigger>
        <TabsTrigger value="closed">Resolved & Closed</TabsTrigger>
      </TabsList>
      <TabsContent value="open">
        <Card>
          <CardContent className="pt-6">
            {renderTable(filteredTickets('open'))}
          </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="closed">
        <Card>
          <CardContent className="pt-6">
            {renderTable(filteredTickets('closed'))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Manage Ticket #{selectedTicket?.ticket_id.slice(-6)}</DialogTitle>
            <DialogDescription>{selectedTicket?.subject}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="p-4 rounded-lg border bg-muted/50">
                <h4 className="font-semibold text-sm mb-2">Original Request</h4>
                <p className="text-sm text-muted-foreground">{selectedTicket?.description}</p>
                 <p className="text-xs text-muted-foreground mt-2">
                    Submitted by {selectedTicket?.submitted_by_user} from {selectedTicket?.submitted_by_company} on {selectedTicket && format(new Date(selectedTicket.created_at), "PPp")}
                </p>
            </div>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem><FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{Object.keys(statusConfig).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="priority" render={({ field }) => (
                             <FormItem><FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{Object.keys(priorityConfig).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                </Select><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="admin_notes" render={({ field }) => (
                        <FormItem><FormLabel>Internal Notes</FormLabel><FormControl><Textarea placeholder="Add notes for your team..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <DialogFooter className="pt-4">
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button type="submit"><Save className="mr-2 h-4 w-4"/>Save Changes</Button>
                    </DialogFooter>
                </form>
             </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
