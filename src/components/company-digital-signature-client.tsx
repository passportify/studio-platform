"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { DigitalSignature } from "@/lib/types";
import { mockCompanySignatures, mockEntityNames, mockUserNames } from "@/lib/mock-data";

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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, FileCheck, Handshake, FileText, AlertCircle } from "lucide-react";

export function CompanyDigitalSignatureClient() {
  const { toast } = useToast();
  const [signatures, setSignatures] = useState<DigitalSignature[]>(mockCompanySignatures);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<DigitalSignature | null>(null);

  const entityTypeConfig: Record<DigitalSignature['signable_entity_type'], { icon: React.ElementType }> = {
    DPP_VERSION: { icon: FileCheck },
    SUPPLIER_LINK: { icon: Handshake },
    CERTIFICATE_FILE: { icon: FileText },
    AI_OVERRIDE: { icon: AlertCircle },
  };
  
  const statusConfig: Record<DigitalSignature['signature_status'], { variant: 'default' | 'secondary' | 'destructive' }> = {
    SIGNED: { variant: 'default' },
    REVOKED: { variant: 'destructive' },
    INVALIDATED: { variant: 'destructive' },
  };

  const handleViewDetails = (sig: DigitalSignature) => {
    setSelectedSignature(sig);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Signature Log</CardTitle>
          <CardDescription>A chronological log of all cryptographic signatures created by your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity Signed</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Signed By</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signatures.map((sig) => {
                  const TypeIcon = entityTypeConfig[sig.signable_entity_type].icon;
                  const status = statusConfig[sig.signature_status];
                  return (
                    <TableRow key={sig.signature_id}>
                        <TableCell className="font-medium">{mockEntityNames[sig.signable_entity_id] || sig.signable_entity_id}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                <span>{sig.signable_entity_type.replace('_', ' ')}</span>
                            </div>
                        </TableCell>
                        <TableCell>{mockUserNames[sig.signed_by_user_id] || sig.signed_by_user_id}</TableCell>
                        <TableCell>{format(new Date(sig.signature_timestamp), 'PPp')}</TableCell>
                        <TableCell><Badge variant={status.variant}>{sig.signature_status}</Badge></TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="sm" onClick={() => handleViewDetails(sig)}><Eye className="mr-2 h-4 w-4" /> View Details</Button>
                        </TableCell>
                    </TableRow>
                  )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Signature Details</DialogTitle>
            <DialogDescription>
              Cryptographic signature details for log <span className="font-mono bg-muted px-1 py-0.5 rounded-sm">{selectedSignature?.signature_id}</span>
            </DialogDescription>
          </DialogHeader>
          {selectedSignature && (
            <div className="grid gap-4 py-4 text-sm max-h-[70vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-[150px_1fr] items-start gap-y-2 font-mono text-xs">
                    <span className="font-sans font-medium text-muted-foreground">Entity ID:</span>
                    <span>{selectedSignature.signable_entity_id}</span>

                    <span className="font-sans font-medium text-muted-foreground">Entity Type:</span>
                    <span>{selectedSignature.signable_entity_type}</span>

                    <span className="font-sans font-medium text-muted-foreground">Timestamp:</span>
                    <span>{selectedSignature.signature_timestamp}</span>

                    <span className="font-sans font-medium text-muted-foreground">Signed By User:</span>
                    <span>{selectedSignature.signed_by_user_id}</span>
                    
                    <span className="font-sans font-medium text-muted-foreground">Signed By Company:</span>
                    <span>{selectedSignature.signed_by_company_id}</span>
                    
                    <span className="font-sans font-medium text-muted-foreground">Method:</span>
                    <span>{selectedSignature.signature_method}</span>

                     <span className="font-sans font-medium text-muted-foreground">Blockchain Anchor:</span>
                    <span className="break-all">{selectedSignature.blockchain_anchor_id || 'N/A'}</span>

                    <span className="font-sans font-medium text-muted-foreground">Signature Hash:</span>
                    <span className="break-all">{selectedSignature.signature_hash}</span>
                </div>

                {selectedSignature.signed_payload_snapshot && (
                  <div>
                    <p className="font-sans font-medium text-muted-foreground mb-2">Signed Payload Snapshot</p>
                     <div className="rounded-md border bg-muted/50 p-4 space-y-2 text-sm">
                        {Object.entries(selectedSignature.signed_payload_snapshot).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-[150px_1fr] items-start">
                                <span className="font-semibold capitalize text-card-foreground">{key.replace(/_/g, ' ')}:</span>
                                <span className="break-words font-mono text-xs">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
