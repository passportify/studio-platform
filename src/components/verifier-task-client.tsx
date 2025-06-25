
"use client";

import { useState } from "react";
import type { VerificationTask } from "@/lib/types";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Building, Calendar, FileCheck, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface VerifierTaskClientProps {
  task: VerificationTask;
}

export function VerifierTaskClient({ task }: VerifierTaskClientProps) {
  const { toast } = useToast();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = () => {
    // In a real app, this would be an API call
    console.log("Approving task:", task.verification_id);
    toast({
      title: "Task Approved",
      description: `The document "${task.document_name}" has been marked as verified.`,
    });
    // Here you would typically redirect or update the UI state.
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
        toast({
            variant: 'destructive',
            title: 'Reason required',
            description: 'Please provide a reason for rejection.',
        });
        return;
    }
    // In a real app, this would be an API call
    console.log("Rejecting task:", task.verification_id, "Reason:", rejectionReason);
     toast({
      title: "Task Rejected",
      description: `The document has been marked as rejected.`,
    });
    setIsRejectDialogOpen(false);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2 space-y-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Your Task</AlertTitle>
          <AlertDescription>
            Verify that the document provided satisfies the claim made by <span className="font-semibold">{task.requester_name}</span>.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Document Viewer</CardTitle>
            <CardDescription>{task.document_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <iframe
              src={task.document_url}
              className="w-full aspect-[4/5] bg-muted rounded-md border-2 border-foreground/10"
              title={task.document_name}
            />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Claim to Verify</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                    <FileCheck className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                    <p className="font-semibold">{task.claim}</p>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground"/>
                    <span>Requester: <span className="font-semibold">{task.requester_name}</span></span>
                </div>
                 <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground"/>
                    <span>Submitted: <span className="font-semibold">{format(new Date(task.submitted_at), "PPP")}</span></span>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Take Action</CardTitle>
                <CardDescription>Approve or reject this submission.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button className="w-full" onClick={handleApprove}>
                    <Check className="mr-2 h-4 w-4" /> Approve
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => setIsRejectDialogOpen(true)}>
                    <X className="mr-2 h-4 w-4" /> Reject
                </Button>
            </CardContent>
        </Card>
      </div>

       <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide a clear reason for rejecting this document. This will be shared with the submitting company.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., The document is expired, key information is missing..."
            />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
            <Button type="button" variant="destructive" onClick={handleReject}>Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    
