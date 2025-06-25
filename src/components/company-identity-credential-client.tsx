
"use client";

import { useState, useMemo } from "react";
import type { DecentralizedIdentifier, VerifiableCredential } from "@/lib/types";
import { mockCompanyDids, mockCompanyVerifiableCredentials, mockEntityNames } from "@/lib/mock-data";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Fingerprint, Award, Check, X, Building, Box, User, Link2 } from "lucide-react";

export function CompanyIdentityCredentialClient() {
  const [isDidDetailsOpen, setIsDidDetailsOpen] = useState(false);
  const [selectedDid, setSelectedDid] = useState<DecentralizedIdentifier | null>(null);

  const [isVcDetailsOpen, setIsVcDetailsOpen] = useState(false);
  const [selectedVc, setSelectedVc] = useState<VerifiableCredential | null>(null);

  const didEntityTypeConfig: Record<DecentralizedIdentifier['did_entity_type'], { icon: React.ElementType }> = {
    COMPANY: { icon: Building },
    SUPPLIER: { icon: Link2 },
    USER: { icon: User },
    PRODUCT_ITEM: { icon: Box },
    CERTIFICATE: { icon: Award },
  };

  const vcStatusConfig: Record<VerifiableCredential['vc_status'], { variant: 'default' | 'secondary' | 'destructive' }> = {
    ISSUED: { variant: 'default' },
    REVOKED: { variant: 'destructive' },
    EXPIRED: { variant: 'destructive' },
    SUSPENDED: { variant: 'secondary' },
  };

  const handleViewDidDetails = (did: DecentralizedIdentifier) => {
    setSelectedDid(did);
    setIsDidDetailsOpen(true);
  };

  const handleViewVcDetails = (vc: VerifiableCredential) => {
    setSelectedVc(vc);
    setIsVcDetailsOpen(true);
  };
  
  return (
    <Tabs defaultValue="dids" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="dids">Your DIDs</TabsTrigger>
        <TabsTrigger value="credentials">Your VCs</TabsTrigger>
      </TabsList>
      <TabsContent value="dids">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Your Decentralized Identifiers (DIDs)</CardTitle>
            <CardDescription>A log of all unique identities associated with your company.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>DID URI</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCompanyDids.map((did) => {
                  const Icon = didEntityTypeConfig[did.did_entity_type].icon;
                  return (
                    <TableRow key={did.did_uri}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{mockEntityNames[did.did_entity_id] || did.did_entity_id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{did.did_entity_type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-sm truncate">{did.did_uri}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDidDetails(did)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View DID Doc
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="credentials">
         <Card>
          <CardHeader>
            <CardTitle className="font-headline">Your Verifiable Credentials (VCs)</CardTitle>
            <CardDescription>A log of all credentials issued by or to your company.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCompanyVerifiableCredentials.map((vc) => (
                    <TableRow key={vc.vc_id}>
                      <TableCell className="font-medium">{vc.vc_type.replace('_', ' ')}</TableCell>
                      <TableCell className="max-w-xs truncate">{mockEntityNames[vc.vc_subject_did.split(':')[2]] || vc.vc_subject_did}</TableCell>
                      <TableCell className="max-w-xs truncate">{mockEntityNames[vc.vc_issuer_did.split(':')[2]] || vc.vc_issuer_did}</TableCell>
                      <TableCell>
                        <Badge variant={vcStatusConfig[vc.vc_status].variant}>
                          {vc.vc_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewVcDetails(vc)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Credential
                        </Button>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <Dialog open={isDidDetailsOpen} onOpenChange={setIsDidDetailsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline">DID Document</DialogTitle>
            <DialogDescription className="font-mono text-xs break-all">
                {selectedDid?.did_uri}
            </DialogDescription>
          </DialogHeader>
          {selectedDid && (
             <div className="py-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="font-mono text-xs space-y-2 rounded-lg border bg-muted/50 p-4">
                    {Object.entries(selectedDid.did_doc).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-[120px,1fr] gap-2 items-start">
                            <strong className="font-sans font-semibold text-sm text-muted-foreground">{key}:</strong>
                            {typeof value === 'object' ? (
                                <pre className="text-xs bg-background p-2 rounded-md whitespace-pre-wrap break-all">{JSON.stringify(value, null, 2)}</pre>
                            ) : (
                                <span className="font-sans text-sm break-all">{String(value)}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          )}
           <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isVcDetailsOpen} onOpenChange={setIsVcDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Verifiable Credential Details</DialogTitle>
            <DialogDescription className="font-mono text-xs break-all">
                ID: {selectedVc?.vc_id}
            </DialogDescription>
          </DialogHeader>
          {selectedVc && (
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                <div>
                    <h4 className="font-semibold text-sm mb-1">Payload</h4>
                    <div className="font-mono text-xs space-y-2 rounded-lg border bg-muted/50 p-4">
                        {Object.entries(selectedVc.vc_payload).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-[120px,1fr] gap-2 items-start">
                                <strong className="font-sans font-semibold text-sm text-muted-foreground">{key}:</strong>
                                {typeof value === 'object' ? (
                                    <pre className="text-xs bg-background p-2 rounded-md whitespace-pre-wrap break-all">{JSON.stringify(value, null, 2)}</pre>
                                ) : (
                                    <span className="font-sans text-sm break-all">{String(value)}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-sm mb-1">Signature</h4>
                     <div className="font-mono text-xs space-y-2 rounded-lg border bg-muted/50 p-4">
                        {Object.entries(selectedVc.vc_signature).map(([key, value]) => (
                             <div key={key} className="grid grid-cols-[120px,1fr] gap-2 items-start">
                                <strong className="font-sans font-semibold text-sm text-muted-foreground">{key}:</strong>
                                {typeof value === 'object' ? (
                                    <pre className="text-xs bg-background p-2 rounded-md whitespace-pre-wrap break-all">{JSON.stringify(value, null, 2)}</pre>
                                ) : (
                                    <span className="font-sans text-sm break-all">{String(value)}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          )}
           <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
