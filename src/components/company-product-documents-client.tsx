
"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { mockUploadedDocuments, mockVerifiers, mockCompanyProducts, mockCategories, mockCertificateRules } from "@/lib/mock-data";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, FileClock, FileX, AlertTriangle, Upload, Replace, Calendar as CalendarIcon, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Document, CertificateRule } from '@/lib/types';

type DocumentStatus = "Pending" | "Verified" | "Rejected" | "Missing";

const documentFormSchema = z.object({
  documentType: z.string({ required_error: "Please select a document type." }),
  expiryDate: z.date().optional(),
  file: z.any().refine(files => files?.length > 0, "File is required."),
});
type DocumentFormData = z.infer<typeof documentFormSchema>;

const verificationFormSchema = z.object({
  verifierId: z.string({ required_error: "Please select a verifier." }),
  notes: z.string().optional(),
});
type VerificationFormData = z.infer<typeof verificationFormSchema>;


export function CompanyProductDocumentsClient({ productId }: { productId: string }) {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CertificateRule | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState(mockUploadedDocuments);

  const complianceChecklist = useMemo(() => {
    const product = mockCompanyProducts.find(p => p.id === productId);
    if (!product) return [];

    const category = mockCategories.find(c => c.category_name === 'EV Battery'); // Simplified for mock
    if (!category) return [];

    const requiredRules = mockCertificateRules.filter(rule => rule.industry_id === category.industry_id && rule.active);
    
    return requiredRules.map(rule => {
      const doc = uploadedDocuments.find(d => d.certificate_rule_id === rule.certificate_rule_id);
      return {
        ...rule,
        status: doc ? doc.human_verification_status : 'Missing',
        document: doc || null,
      };
    });
  }, [productId, uploadedDocuments]);

  const docForm = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
  });
  
  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationFormSchema),
  });

  const handleUploadClick = (rule: CertificateRule) => {
    setSelectedRule(rule);
    docForm.reset({
        documentType: rule.certificate_type.includes("Report") ? "Test Report" : rule.certificate_type.includes("Declaration") ? "Declaration" : "Certificate",
    });
    setIsFormOpen(true);
  };
  
  const handleRequestVerificationClick = (document: Document) => {
    setSelectedDocument(document);
    verificationForm.reset();
    setIsVerificationOpen(true);
  };

  const onDocSubmit = (data: DocumentFormData) => {
    if (!selectedRule) return;

    const newDoc: Document = {
      document_id: `doc_${Date.now()}`,
      certificate_rule_id: selectedRule.certificate_rule_id,
      document_name: data.file[0].name,
      file_name: data.file[0].name,
      document_type: data.documentType,
      human_verification_status: "Pending",
      upload_date: new Date().toISOString(),
      valid_until: data.expiryDate?.toISOString(),
      product_id: productId, // Link to current product
      supplier_id: 'sup_1', // Mocked
      file_extension: 'pdf', // Mocked
      file_size_kb: 1200, // Mocked
      hash_checksum: 'mock_hash', // Mocked
      visibility_scope: 'Shared', // Mocked
      document_version: 1, // Mocked
    };
    
    setUploadedDocuments(prev => [...prev.filter(d => d.certificate_rule_id !== selectedRule.certificate_rule_id), newDoc]);
    
    toast({ title: "Document Uploaded", description: `${newDoc.document_name} has been added for review.` });
    setIsFormOpen(false);
  };
  
  const onVerificationSubmit = (data: VerificationFormData) => {
    toast({ title: "Verification Requested", description: `Your document has been sent to the selected verifier for review.` });
    setIsVerificationOpen(false);
  }

  const statusConfig: Record<DocumentStatus, { variant: "default" | "secondary" | "destructive", icon: React.ElementType }> = {
    Verified: { variant: "default", icon: CheckCircle },
    Pending: { variant: "secondary", icon: FileClock },
    Rejected: { variant: "destructive", icon: AlertTriangle },
    Missing: { variant: "destructive", icon: FileX },
  };

  const renderAction = (item: typeof complianceChecklist[0]) => {
    if (!item.document) {
      return (
        <Button variant="outline" size="sm" onClick={() => handleUploadClick(item)}>
          <Upload /> Upload
        </Button>
      );
    }
    switch (item.status) {
      case 'Pending':
        return (
          <Button size="sm" onClick={() => handleRequestVerificationClick(item.document!)}>
            <ShieldQuestion /> Request Verification
          </Button>
        );
      case 'Verified':
      case 'Rejected':
        return (
          <Button variant="outline" size="sm" onClick={() => handleUploadClick(item)}>
            <Replace /> Replace
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>Compliance Checklist</CardTitle>
            <CardDescription>Upload and manage all required compliance documents for this product.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {complianceChecklist.map((item) => {
                    const config = statusConfig[item.status as DocumentStatus];
                    return (
                        <div key={item.certificate_rule_id} className="flex items-center gap-4 rounded-lg border p-4">
                            <config.icon className={cn("size-8 shrink-0", 
                                item.status === 'Verified' && 'text-green-600',
                                item.status === 'Pending' && 'text-yellow-600',
                                item.status === 'Missing' && 'text-destructive',
                                item.status === 'Rejected' && 'text-destructive'
                            )} />
                            <div className="flex-1">
                                <p className="font-semibold">{item.certificate_type}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                {item.document && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        File: <span className="font-mono">{item.document.document_name}</span> | Expires: {item.document.valid_until ? format(new Date(item.document.valid_until), "PPP") : 'N/A'}
                                    </p>
                                )}
                            </div>
                             <div className="flex items-center gap-2">
                                <Badge variant={config.variant} className="gap-1.5 w-28 justify-center hidden sm:flex">
                                    <config.icon className="size-3.5"/>
                                    {item.status}
                                </Badge>
                                <div className="w-44 text-right">
                                    {renderAction(item)}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload: {selectedRule?.certificate_type}</DialogTitle>
            <DialogDescription>Attach the required compliance document.</DialogDescription>
          </DialogHeader>
          <Form {...docForm}>
            <form onSubmit={docForm.handleSubmit(onDocSubmit)} className="space-y-4 py-4">
              <FormField control={docForm.control} name="file" render={({ field }) => (
                <FormItem><FormLabel>File</FormLabel><FormControl><Input type="file" onChange={e => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={docForm.control} name="documentType" render={({ field }) => (
                <FormItem><FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a type..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Test Report">Test Report</SelectItem>
                      <SelectItem value="Declaration">Declaration</SelectItem>
                      <SelectItem value="Certificate">Certificate</SelectItem>
                      <SelectItem value="Data Sheet">Data Sheet</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
              <FormField control={docForm.control} name="expiryDate" render={({ field }) => (
                <FormItem><FormLabel>Expiry Date (Optional)</FormLabel><FormControl>
                   <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">Upload</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Third-Party Verification</DialogTitle>
            <DialogDescription>Submit <span className="font-semibold">{selectedDocument?.document_name}</span> to an accredited third-party for attestation.</DialogDescription>
          </DialogHeader>
           <Form {...verificationForm}>
              <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4 py-4">
                <FormField control={verificationForm.control} name="verifierId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approved Verifier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a verifier..." /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockVerifiers.map(v => <SelectItem key={v.supplier_id} value={v.supplier_id}>{v.legal_entity_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit"><ShieldQuestion /> Submit for Verification</Button>
                </DialogFooter>
              </form>
           </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
