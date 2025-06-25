
"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { BlockchainAnchor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { mockAnchors, mockEntityNames } from "@/lib/mock-data";

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
import Link from 'next/link';
import { Eye, FileCheck, Award, Handshake, CheckCircle, AlertCircle, Loader, ExternalLink } from "lucide-react";

export function BlockchainAnchorClient() {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAnchor, setSelectedAnchor] = useState<BlockchainAnchor | null>(null);
  
  const recordTypeConfig: Record<BlockchainAnchor['record_type'], { icon: React.ElementType, color: string }> = {
    DPP_VERSION: { icon: FileCheck, color: 'text-blue-500' },
    CERTIFICATE_HASH: { icon: Award, color: 'text-yellow-500' },
    SUPPLIER_ATTESTATION: { icon: Handshake, color: 'text-green-500' },
    PRODUCT_METADATA: { icon: FileCheck, color: 'text-purple-500' },
    AUDIT_LOG: { icon: FileCheck, color: 'text-gray-500' },
  };

  const statusConfig: Record<BlockchainAnchor['anchor_status'], { icon: React.ElementType, color: string, badge: "default" | "secondary" | "destructive" }> = {
    CONFIRMED: { icon: CheckCircle, color: 'text-green-500', badge: 'default' },
    PENDING: { icon: Loader, color: 'text-orange-500', badge: 'secondary' },
    FAILED: { icon: AlertCircle, color: 'text-red-500', badge: 'destructive' },
  };

  const handleViewDetails = (log: BlockchainAnchor) => {
    setSelectedAnchor(log);
    setIsDetailsOpen(true);
  };

  return (
    <>
        <Card>
            <CardHeader>
            <CardTitle className="font-headline">Anchor Log</CardTitle>
            <CardDescription>Chronological record of all data anchoring events.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Record</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {mockAnchors.map((anchor) => {
                    const typeConf = recordTypeConfig[anchor.record_type];
                    const statusConf = statusConfig[anchor.anchor_status];
                    return (
                        <TableRow key={anchor.anchor_id}>
                            <TableCell className="font-medium">{mockEntityNames[anchor.record_id] || anchor.record_id}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <typeConf.icon className={cn("h-4 w-4", typeConf.color)} />
                                    <span>{anchor.record_type.replace('_', ' ')}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={statusConf.badge} className="gap-1.5">
                                    <statusConf.icon className={cn("h-3.5 w-3.5")} />
                                    {anchor.anchor_status}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(anchor.timestamp_utc), "PPp")}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(anchor)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}
                </TableBody>
            </Table>
            </CardContent>
        </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Anchor Details</DialogTitle>
            <DialogDescription>
              Details for anchor <span className="font-mono bg-muted px-1 py-0.5 rounded-sm">{selectedAnchor?.anchor_id}</span>
            </DialogDescription>
          </DialogHeader>
          {selectedAnchor && (
            <div className="grid gap-4 py-4 text-sm max-h-[70vh] overflow-y-auto pr-4 font-mono text-xs">
                <div className="grid grid-cols-[150px_1fr] items-center">
                    <span className="font-sans font-medium text-muted-foreground">Record ID:</span>
                    <span>{selectedAnchor.record_id}</span>
                </div>
                 <div className="grid grid-cols-[150px_1fr] items-center">
                    <span className="font-sans font-medium text-muted-foreground">Record Type:</span>
                    <span>{selectedAnchor.record_type}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] items-center">
                    <span className="font-sans font-medium text-muted-foreground">Timestamp:</span>
                    <span>{selectedAnchor.timestamp_utc}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] items-center">
                    <span className="font-sans font-medium text-muted-foreground">Blockchain:</span>
                    <span>{selectedAnchor.blockchain_type}</span>
                </div>
                 <div className="grid grid-cols-[150px_1fr] items-center">
                    <span className="font-sans font-medium text-muted-foreground">Status:</span>
                    <span>{selectedAnchor.anchor_status}</span>
                </div>
                 <div className="grid grid-cols-[150px_1fr] items-start">
                    <span className="font-sans font-medium text-muted-foreground">Data Hash (SHA256):</span>
                    <span className="break-all">{selectedAnchor.data_hash}</span>
                </div>
                 <div className="grid grid-cols-[150px_1fr] items-start">
                    <span className="font-sans font-medium text-muted-foreground">Transaction Hash:</span>
                    <span className="break-all">{selectedAnchor.transaction_hash}</span>
                </div>
                {selectedAnchor.anchor_url && (
                    <div className="grid grid-cols-[150px_1fr] items-center">
                        <span className="font-sans font-medium text-muted-foreground">Block Explorer:</span>
                        <Link href={selectedAnchor.anchor_url} target="_blank" rel="noopener noreferrer" className="font-sans text-primary hover:underline flex items-center gap-1">
                            View Transaction <ExternalLink className="h-3 w-3"/>
                        </Link>
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
