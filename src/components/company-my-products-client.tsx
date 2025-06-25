
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import { mockCompanyProducts, mockUploadedDocuments, mockCertificateRules, mockTraceabilityData } from '@/lib/mock-data';

import type { QRCodeLog, CompanyProduct, TraceabilityRecord, CertificateRule } from '@/lib/types';
import { generateQRCodeAction } from '@/app/superadmin/qr-code-engine/actions';
import { analyzeProductCompliance, type ProductComplianceAnalysisOutput } from "@/ai/flows/product-compliance-analysis";
import { analyzeTraceability, type TraceabilityAnalysisOutput } from "@/ai/flows/traceability-check";


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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, FilePlus2, Eye, Pen, Trash2, BarChart, Network, PenSquare, FileText, Loader2, QrCode, Download, ChevronRight, CheckCircle, FileWarning, BrainCircuit, FileScan, ShieldAlert, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle } from "@/components/ui/alert";

type ProductStatus = "Approved" | "Draft" | "Submitted" | "Rejected";
type Product = CompanyProduct & { lastUpdatedFormatted?: string };

const statusConfig: Record<ProductStatus, { variant: "default" | "secondary" | "destructive" }> = {
    Approved: { variant: "default" },
    Submitted: { variant: "secondary" },
    Draft: { variant: "secondary" },
    Rejected: { variant: "destructive" },
};

const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-destructive";
};


export function CompanyMyProductsClient() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isScoreDetailsOpen, setIsScoreDetailsOpen] = useState(false);
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [isQrSuccessDialogOpen, setIsQrSuccessDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedQrCode, setGeneratedQrCode] = useState<QRCodeLog | null>(null);

  // AI Check states
  const [isDocCheckOpen, setIsDocCheckOpen] = useState(false);
  const [docCheckResult, setDocCheckResult] = useState<ProductComplianceAnalysisOutput | null>(null);
  const [isCheckingDocs, setIsCheckingDocs] = useState(false);
  const [isTraceabilityCheckOpen, setIsTraceabilityCheckOpen] = useState(false);
  const [traceabilityCheckResult, setTraceabilityCheckResult] = useState<TraceabilityAnalysisOutput | null>(null);
  const [isCheckingTraceability, setIsCheckingTraceability] = useState(false);


  useEffect(() => {
    // Format dates on the client-side to prevent hydration errors
    const formatted = mockCompanyProducts.map(p => ({
      ...p,
      lastUpdatedFormatted: format(new Date(p.lastUpdated), "PPp"),
    }));
    setProducts(formatted);
  }, []);

  const handleAiDocCheck = async (product: Product) => {
    setSelectedProduct(product);
    setIsCheckingDocs(true);
    setDocCheckResult(null);
    setIsDocCheckOpen(true);
    try {
      // In a real app, you would fetch real data. Here we use mock data.
      const relevantDocs = mockUploadedDocuments.filter(d => d.product_id === product.id);
      const input = {
        productName: product.name,
        rules: mockCertificateRules.filter(r => r.industry_id === '1').map(r => ({ certificateName: r.certificate_type, description: r.description })), // Mock: Assume all battery rules apply
        documents: relevantDocs.map(d => ({
          documentName: d.file_name,
          documentType: d.document_type,
          dataUri: 'data:application/pdf;base64,', // Mock Data URI
        })),
      };
      const result = await analyzeProductCompliance(input);
      setDocCheckResult(result);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI Check Failed', description: 'Could not perform document compliance analysis.' });
      setIsDocCheckOpen(false);
    } finally {
      setIsCheckingDocs(false);
    }
  };
  
  const handleAiTraceabilityCheck = async (product: Product) => {
    setSelectedProduct(product);
    setIsCheckingTraceability(true);
    setTraceabilityCheckResult(null);
    setIsTraceabilityCheckOpen(true);
    try {
        const relevantTraceData = mockTraceabilityData.filter(t => t.product_id === product.id);
        const input = {
            productName: product.name,
            billOfMaterialsJson: JSON.stringify(relevantTraceData, null, 2),
        };
        const result = await analyzeTraceability(input);
        setTraceabilityCheckResult(result);
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'AI Check Failed', description: 'Could not perform traceability analysis.' });
        setIsTraceabilityCheckOpen(false);
    } finally {
        setIsCheckingTraceability(false);
    }
  };

  const handleViewScore = (product: Product) => {
    setSelectedProduct(product);
    setIsScoreDetailsOpen(true);
  };
  
  const handleSignVersion = (product: Product) => {
    setSelectedProduct(product);
    setIsSignDialogOpen(true);
  };
  
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your product data export is being generated. You will receive an email with the download link shortly.",
    });
  };

  const confirmSignAndPublish = async () => {
    if (!selectedProduct) return;
    setIsPublishing(true);
    
    try {
      const result = await generateQRCodeAction({
        productId: selectedProduct.id,
        versionId: selectedProduct.version,
      });

      if (result.success && result.data) {
        setGeneratedQrCode(result.data);
        toast({
            title: "DPP Published!",
            description: `Version ${selectedProduct.version} of ${selectedProduct.name} is now public.`
        });
        setIsSignDialogOpen(false);
        setIsQrSuccessDialogOpen(true);
      } else {
         throw new Error(result.error || 'An unknown error occurred during QR code generation.');
      }
    } catch (error) {
       console.error("Publishing failed:", error);
       toast({
        variant: "destructive",
        title: "Publish Failed",
        description: error instanceof Error ? error.message : "Could not publish the DPP.",
      });
    } finally {
        setIsPublishing(false);
    }
  }

  const complianceResultVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "compliant": return "default";
      case "issues found": return "destructive";
      default: return "secondary";
    }
  };
   const complianceStatusIcon = (status: string) => {
    switch (status) {
        case 'Verified': return <ShieldCheck className="h-4 w-4 text-green-600" />;
        case 'Missing': return <FileWarning className="h-4 w-4 text-yellow-500" />;
        case 'Issue Found': return <ShieldAlert className="h-4 w-4 text-destructive" />;
        default: return null;
    }
  };
   const riskLevelConfig = {
    'Low': { variant: 'default' as const, color: 'text-green-600' },
    'Medium': { variant: 'secondary' as const, color: 'text-yellow-600' },
    'High': { variant: 'destructive' as const, color: 'text-destructive' },
  };

  return (
    <>
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Product List</CardTitle>
                    <CardDescription>A list of all products you have submitted.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download />
                        Export All
                    </Button>
                    <Button asChild>
                    <Link href="/company-portal/my-products/new">
                        <FilePlus2 />
                        Add New Product
                    </Link>
                    </Button>
                </div>
            </div>
        </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>DPP Score</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant={statusConfig[product.status as ProductStatus].variant}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleViewScore(product)} className={`font-bold ${getScoreColor(product.score)}`}>
                        <BarChart />
                        {product.score} / 100
                    </Button>
                </TableCell>
                <TableCell>{product.lastUpdatedFormatted}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                          <Link href={`/view/${product.id}`} target="_blank">
                              <Eye />
                              View
                          </Link>
                      </Button>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/company-portal/my-products/${product.id}/traceability`}>
                                    <Network /> Manage Traceability
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/company-portal/my-products/${product.id}/documents`}>
                                    <FileText /> Manage Documents
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pen /> Edit Product Data
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAiTraceabilityCheck(product)}>
                                <BrainCircuit /> AI Traceability Check
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAiDocCheck(product)}>
                                <FileScan /> AI Document Check
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSignVersion(product)} disabled={product.status !== 'Approved'}>
                                <PenSquare /> Sign & Publish Version
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 /> Delete Draft
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={isScoreDetailsOpen} onOpenChange={setIsScoreDetailsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">DPP Score Breakdown</DialogTitle>
          <DialogDescription>
            Score for {selectedProduct?.name} (Version {selectedProduct?.version})
          </DialogDescription>
        </DialogHeader>
        {selectedProduct && (
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Compliance</span>
                        <span>{selectedProduct.scoreBreakdown.compliance} / 100</span>
                    </div>
                    <Progress value={selectedProduct.scoreBreakdown.compliance} />
                    <p className="text-xs text-muted-foreground">Based on required fields, document validity, and rule adherence.</p>
                </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Traceability</span>
                        <span>{selectedProduct.scoreBreakdown.traceability} / 100</span>
                    </div>
                    <Progress value={selectedProduct.scoreBreakdown.traceability} />
                    <p className="text-xs text-muted-foreground">Based on material completeness and supply chain tier depth.</p>
                </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Sustainability</span>
                        <span>{selectedProduct.scoreBreakdown.sustainability} / 100</span>
                    </div>
                    <Progress value={selectedProduct.scoreBreakdown.sustainability} />
                    <p className="text-xs text-muted-foreground">Based on recycled content, repairability, and certifications.</p>
                </div>
                
                {selectedProduct.improvementSuggestions && selectedProduct.improvementSuggestions.length > 0 ? (
                   <div className="mt-6 border-t pt-4">
                       <h4 className="font-semibold mb-2 flex items-center gap-2"><FileWarning className="text-yellow-500" /> Improvement Areas</h4>
                       <div className="space-y-3">
                           {selectedProduct.improvementSuggestions.map((suggestion, index) => (
                               <Link key={index} href={suggestion.link} className="block p-3 rounded-lg border hover:bg-accent">
                                   <div className="flex items-center justify-between">
                                       <div>
                                           <p className="font-semibold">{suggestion.title}</p>
                                           <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                                       </div>
                                       <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                                   </div>
                               </Link>
                           ))}
                       </div>
                   </div>
                ) : (
                    <div className="mt-6 text-center text-sm text-muted-foreground border-t pt-6">
                        <CheckCircle className="mx-auto h-8 w-8 text-green-500"/>
                        <p className="font-semibold">All required data present!</p>
                        <p>No immediate improvement areas found.</p>
                    </div>
                )}
            </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign and Publish DPP?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to sign and publish version <span className="font-bold">{selectedProduct?.version}</span> of <span className="font-bold">{selectedProduct?.name}</span>. This action will make the Digital Product Passport publicly accessible and generate its QR code. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProduct(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSignAndPublish} disabled={isPublishing}>
                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PenSquare />}
                {isPublishing ? "Publishing..." : "Sign & Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <Dialog open={isQrSuccessDialogOpen} onOpenChange={setIsQrSuccessDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">DPP Published &amp; QR Code Generated!</DialogTitle>
                <DialogDescription>
                    The QR code for {selectedProduct?.name} is ready. This will also create a new entry in the QR Code Engine log.
                </DialogDescription>
            </DialogHeader>
            {generatedQrCode && (
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="p-4 bg-white rounded-lg border">
                    <Image data-ai-hint="product QR code" src={generatedQrCode.rendered_image_base64} alt="Generated QR Code" width={256} height={256} />
                    </div>
                    <Button asChild className="w-full">
                        <a href={generatedQrCode.rendered_image_base64} download={`${selectedProduct?.name}_QR.png`}>
                            Download QR Code
                        </a>
                    </Button>
                </div>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="secondary" onClick={() => setGeneratedQrCode(null)}>Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isDocCheckOpen} onOpenChange={setIsDocCheckOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">AI Document Compliance Report</DialogTitle>
                <DialogDescription>Analysis results for {selectedProduct?.name}.</DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
                {isCheckingDocs ? (
                    <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin"/>
                        <p>AI is analyzing documents...</p>
                    </div>
                ) : docCheckResult ? (
                    <div className="space-y-4">
                        <Alert variant={complianceResultVariant(docCheckResult.overallStatus)}>
                            <AlertTitle>{docCheckResult.overallStatus}</AlertTitle>
                            <p>{docCheckResult.overallSummary}</p>
                        </Alert>
                        <div className="space-y-2">
                            {docCheckResult.documentResults.map((res, i) => (
                                <div key={i} className="p-3 border rounded-md">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold flex items-center gap-2">
                                            {complianceStatusIcon(res.status)}
                                            {res.ruleName}
                                        </p>
                                        <Badge variant={res.status === 'Verified' ? 'default' : 'destructive'}>{res.status}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">{res.notes}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">No results to display.</p>
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>

     <Dialog open={isTraceabilityCheckOpen} onOpenChange={setIsTraceabilityCheckOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">AI Traceability Analysis</DialogTitle>
                <DialogDescription>Supply chain risk report for {selectedProduct?.name}.</DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
                {isCheckingTraceability ? (
                    <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin"/>
                        <p>AI is analyzing supply chain...</p>
                    </div>
                ) : traceabilityCheckResult ? (
                    <div className="space-y-4">
                        <Alert variant={riskLevelConfig[traceabilityCheckResult.overallRiskLevel].variant}>
                            <AlertTitle>Overall Risk Level: {traceabilityCheckResult.overallRiskLevel}</AlertTitle>
                            <p>{traceabilityCheckResult.summary}</p>
                        </Alert>
                        <div className="space-y-3">
                            <h4 className="font-semibold">Identified Issues:</h4>
                            {traceabilityCheckResult.issues.map((issue, i) => (
                                <div key={i} className="p-3 border rounded-md">
                                    <p className="font-semibold">{issue.riskCategory}</p>
                                    <p className="text-sm">{issue.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1"><b>Recommendation:</b> {issue.recommendation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">No results to display.</p>
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
