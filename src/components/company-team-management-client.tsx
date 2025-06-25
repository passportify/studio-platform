
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { mockCompanyTeamMembers } from "@/lib/mock-data";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreHorizontal, Pen, Trash2, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


type Role = "Admin" | "Approver" | "Editor" | "Viewer";

type TeamMember = {
    id: string;
    name: string;
    email: string;
    role: Role;
    lastActive: string;
    avatarUrl?: string;
};

// This would typically come from the authenticated user's session data.
const ADMIN_DOMAIN = "ultracell.de";

const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(["Admin", "Approver", "Editor", "Viewer"]),
}).refine(data => {
    const emailDomain = data.email.split('@')[1];
    return emailDomain.toLowerCase() === ADMIN_DOMAIN;
}, {
    message: `Only emails from the @${ADMIN_DOMAIN} domain can be invited. To invite an external user, please contact the platform administrator.`,
    path: ["email"], // Apply this error message to the email field
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

const roleConfig: Record<Role, { variant: "default" | "secondary" | "destructive" }> = {
    Admin: { variant: "default" },
    Approver: { variant: "secondary" },
    Editor: { variant: "secondary" },
    Viewer: { variant: "secondary" },
};

export function CompanyTeamManagementClient() {
  const { toast } = useToast();
  const [members, setMembers] = useState(mockCompanyTeamMembers);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { email: "", role: "Editor" },
  });

  const onSubmit = (data: InviteFormData) => {
    // In a real app, this would be an API call.
    // For this mock, we just add to the local state.
    const newMember: TeamMember = {
        id: `user_${Date.now()}`,
        name: data.email.split('@')[0], // Mock name
        email: data.email,
        role: data.role as Role,
        lastActive: new Date().toISOString(),
    };
    setMembers(prev => [newMember, ...prev]);
    toast({ title: "Invitation Sent", description: `An invitation has been sent to ${data.email}.` });
    setIsInviteOpen(false);
    form.reset();
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>A list of all users in your organization.</CardDescription>
            </div>
            <Button onClick={() => setIsInviteOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => {
                const role = (member.role ?? 'Viewer') as Role;
const config = roleConfig[role] || roleConfig.Viewer;
                return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage data-ai-hint="person portrait" src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p>{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(member.lastActive), "PPP")}</TableCell>
                   <TableCell className="text-right">
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Options</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Pen className="mr-2 h-4 w-4" /> Edit Role</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Remove Member</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">Invite New Team Member</DialogTitle>
            <DialogDescription>
              The user will receive an email with instructions to join your company portal.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., new.member@ultracell.de" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Admin">Admin (Full Control)</SelectItem>
                            <SelectItem value="Approver">Approver (Can sign/publish DPPs)</SelectItem>
                            <SelectItem value="Editor">Editor (Can create/edit DPPs)</SelectItem>
                            <SelectItem value="Viewer">Viewer (Read-only access)</SelectItem>
                        </SelectContent>
                     </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">
                  <Mail className="mr-2 h-4 w-4" /> Send Invitation
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
