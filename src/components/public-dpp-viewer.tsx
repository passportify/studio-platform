
"use client";

import Image from "next/image";
import { format } from "date-fns";
import type { PublicDppData } from "@/lib/types";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleDot, ShieldCheck, Factory, Recycle, Wrench, Sprout, Info, HardHat, Package, Calendar, Weight, Ruler, Thermometer, Zap, BatteryCharging, Footprints, Leaf, Globe, Lock, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


type DetailRowProps = {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
};

const DetailRow: React.FC<DetailRowProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start justify-between py-2">
    <div className="flex items-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
      <span className="font-medium text-muted-foreground">{label}</span>
    </div>
    <span className="text-right font-semibold">{value}</span>
  </div>
);

export function PublicDppViewer({ data }: { data: PublicDppData }) {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Client-side effect to format dates, preventing hydration mismatches.
    setLastUpdated(format(new Date(data.lastUpdatedAt), "PPPp"));
    if (data.digitalSignature) {
      setSignedAt(format(new Date(data.digitalSignature.signedAt), "PPPp"));
    }
  }, [data.lastUpdatedAt, data.digitalSignature]);


  const complianceStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "compliant": return "default";
      case "incomplete": return "secondary";
      default: return "destructive";
    }
  };
  
  const certificateStatusVariant = (status: string) => {
     switch (status.toLowerCase()) {
      case "verified": return "default";
      default: return "destructive";
    }
  }

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
        const doc = new jsPDF();

        // --- Helper functions for layout ---
        const A4_WIDTH = 210;
        const MARGIN = 15;
        const FONT_SIZE_TITLE = 18;
        const FONT_SIZE_H1 = 16;
        const FONT_SIZE_NORMAL = 11;
        const FONT_SIZE_SMALL = 9;
        let yPos = MARGIN;

        const addPageHeader = () => {
            doc.setFontSize(FONT_SIZE_SMALL);
            doc.setTextColor(150);
            doc.text("Digital Product Passport", MARGIN, 10);
            doc.text(new Date().toLocaleDateString(), A4_WIDTH - MARGIN, 10, { align: 'right' });
            doc.setDrawColor(220);
            doc.line(MARGIN, 12, A4_WIDTH - MARGIN, 12);
            yPos = MARGIN + 10;
        };
        
        const checkPageBreak = (spaceNeeded: number) => {
            if (yPos + spaceNeeded > 280) { // A4 height is 297mm
                doc.addPage();
                addPageHeader();
            }
        };

        const addSectionTitle = (title: string) => {
            checkPageBreak(20);
            yPos += 5;
            doc.setFontSize(FONT_SIZE_H1);
            doc.setTextColor(40, 40, 40);
            doc.text(title, MARGIN, yPos);
            yPos += 3;
            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.line(MARGIN, yPos, A4_WIDTH - MARGIN, yPos);
            yPos += 8;
        };

        const addDetailRow = (label: string, value: string) => {
            checkPageBreak(8);
            doc.setFontSize(FONT_SIZE_NORMAL);
            doc.setTextColor(100);
            doc.text(label, MARGIN, yPos);
            doc.setTextColor(0);
            doc.text(value, A4_WIDTH / 2, yPos);
            yPos += 8;
        };

        // --- Start PDF Generation ---
        addPageHeader();
        
        // Main Title
        doc.setFontSize(FONT_SIZE_TITLE);
        doc.setTextColor(0);
        doc.text(data.productName, A4_WIDTH / 2, yPos, { align: 'center' });
        yPos += 6;
        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setTextColor(100);
        doc.text(`Model: ${data.productModel} | Brand: ${data.brandName}`, A4_WIDTH / 2, yPos, { align: 'center' });
        yPos += 15;

        // Add QR code image
        doc.addImage(data.qrCodeImage, 'PNG', MARGIN, yPos, 40, 40);
        
        // Product Identification next to QR
        const initialY = yPos;
        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setTextColor(0);
        doc.text('Product Identification', MARGIN + 50, yPos + 5);
        
        doc.setFontSize(FONT_SIZE_SMALL);
        doc.setTextColor(100);
        doc.text(`GTIN: ${data.productDetails.gtin}`, MARGIN + 50, yPos + 12);
        doc.text(`Serial Number: ${data.productDetails.serialNumber}`, MARGIN + 50, yPos + 18);
        doc.text(`Manufacturing Date: ${format(new Date(data.productDetails.manufacturingDate), "PPP")}`, MARGIN + 50, yPos + 24);
        
        yPos = initialY + 45;

        // --- Sections ---
        addSectionTitle("Manufacturer Information");
        addDetailRow("Name:", data.manufacturerInfo.name);
        addDetailRow("Website:", data.manufacturerInfo.website);
        addDetailRow("Contact:", data.manufacturerInfo.contact);

        addSectionTitle("Technical Specifications");
        addDetailRow("Weight:", `${data.technicalSpecifications.weightKg} kg`);
        addDetailRow("Dimensions:", data.technicalSpecifications.dimensions);
        addDetailRow("Chemistry:", data.technicalSpecifications.chemistry);
        addDetailRow("Nominal Voltage:", data.technicalSpecifications.nominalVoltage);
        
        checkPageBreak(20);
        addSectionTitle("Compliance & Certificates");
        autoTable(doc, {
            startY: yPos,
            head: [['Document Name', 'Type', 'Status', 'Valid Until']],
            body: data.complianceAndCertificates.map(c => [c.name, c.documentType, c.status, c.validUntil === 'N/A' ? 'N/A' : format(new Date(c.validUntil), 'PPP')]),
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [51, 102, 153], fontSize: 10 },
            didDrawPage: (hookData) => { yPos = hookData.cursor?.y || yPos + 10; },
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
        
        addSectionTitle("Material & Circularity");
        addDetailRow("Recycled Content:", `${data.materialAndCircularity.recycledContentPercentage}%`);
        addDetailRow("Reparability Score:", `${data.materialAndCircularity.reparabilityScore} / 10`);
        autoTable(doc, {
            startY: yPos,
            head: [['Material', 'Percentage', 'Origin', 'Hazardous']],
            body: data.materialAndCircularity.materialComposition.map(m => [m.material, `${m.percentage}%`, m.originCountry, m.isHazardous ? 'Yes' : 'No']),
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [51, 102, 153], fontSize: 10 },
            didDrawPage: (hookData) => { yPos = hookData.cursor?.y || yPos + 10; },
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
        
        if (data.digitalSignature) {
            checkPageBreak(25);
            addSectionTitle("Digital Signature");
            addDetailRow("Signed By:", data.digitalSignature.signedBy);
            addDetailRow("Date:", signedAt || format(new Date(data.digitalSignature.signedAt), "PPPp"));
            addDetailRow("Method:", data.digitalSignature.method);
        }

        doc.save(`${data.productName} - DPP.pdf`);

    } catch (error) {
        console.error("PDF generation failed:", error);
        toast({ variant: 'destructive', title: 'PDF Error', description: 'Could not generate the PDF.' });
    } finally {
        setIsGeneratingPdf(false);
    }
  };


  return (
    <TooltipProvider>
    <main className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col items-center text-center md:flex-row md:text-left">
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">{data.brandName}</Badge>
            <CardTitle className="font-headline text-3xl md:text-4xl">{data.productName}</CardTitle>
            <CardDescription className="mt-1">Model: {data.productModel}</CardDescription>
          </div>
          <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-center gap-2">
             <div className="p-2 bg-white rounded-md border">
              <Image data-ai-hint="qr code" src={data.qrCodeImage} alt="Product QR Code" width={100} height={100} />
             </div>
             <Badge variant={complianceStatusVariant(data.complianceStatus)}>
              <ShieldCheck className="mr-1 h-3 w-3" />
              {data.complianceStatus}
             </Badge>
             <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="w-full">
                {isGeneratingPdf ? <Loader2 className="animate-spin" /> : <Download />}
                {isGeneratingPdf ? "Generating..." : "Download PDF"}
             </Button>
          </div>
        </CardHeader>
        <CardContent>
            <div className="aspect-video w-full overflow-hidden rounded-lg border">
                <Image data-ai-hint="product photo" src={data.productImage} alt={data.productName} width={1200} height={800} className="w-full h-full object-cover" />
            </div>
            {lastUpdated && <p className="text-xs text-muted-foreground mt-2 text-center">Last Updated: {lastUpdated}</p>}
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["item-1", "item-2", "item-3", "item-4", "item-5"]} className="w-full space-y-4">
        <AccordionItem value="item-1" className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <AccordionTrigger className="p-6">
            <div className="flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-headline text-lg">Product Identification</h3>
                <p className="text-sm text-muted-foreground font-normal">Core product and manufacturer details.</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
             <DetailRow icon={Package} label="Global Trade Item Number (GTIN)" value={data.productDetails.gtin} />
             <DetailRow icon={CircleDot} label="Serial Number" value={data.productDetails.serialNumber} />
             <DetailRow icon={Calendar} label="Date of Manufacture" value={format(new Date(data.productDetails.manufacturingDate), "PPP")} />
             <hr className="my-2"/>
             <DetailRow icon={Factory} label="Manufacturer" value={data.manufacturerInfo.name} />
             <DetailRow icon={Globe} label="Website" value={<a href={data.manufacturerInfo.website} target="_blank" className="text-primary hover:underline">{data.manufacturerInfo.website}</a>} />
             <DetailRow icon={HardHat} label="Place of Manufacture" value={data.productDetails.placeOfManufacture} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <AccordionTrigger className="p-6">
             <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <div>
                    <h3 className="font-headline text-lg">Compliance & Certificates</h3>
                    <p className="text-sm text-muted-foreground font-normal">Declarations, test reports, and regulatory adherence.</p>
                </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Valid Until</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.complianceAndCertificates.map(cert => (
                        <TableRow key={cert.name}>
                            <TableCell className="font-medium">{cert.name}</TableCell>
                            <TableCell>{cert.documentType}</TableCell>
                            <TableCell><Badge variant={certificateStatusVariant(cert.status)}>{cert.status}</Badge></TableCell>
                            <TableCell>{cert.validUntil === "N/A" ? "N/A" : format(new Date(cert.validUntil), "PPP")}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <AccordionTrigger className="p-6">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-headline text-lg">Technical Specifications</h3>
                <p className="text-sm text-muted-foreground font-normal">Detailed technical properties of the product.</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
              <DetailRow icon={Weight} label="Weight" value={`${data.technicalSpecifications.weightKg} kg`} />
              <DetailRow icon={Ruler} label="Dimensions" value={data.technicalSpecifications.dimensions} />
              <DetailRow icon={BatteryCharging} label="Chemistry" value={data.technicalSpecifications.chemistry} />
              <DetailRow icon={Zap} label="Nominal Voltage" value={data.technicalSpecifications.nominalVoltage} />
              <DetailRow icon={Zap} label="Capacity" value={`${data.technicalSpecifications.capacityAh} Ah`} />
              <DetailRow icon={Thermometer} label="Operating Temperature" value={data.technicalSpecifications.operatingTemperature} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <AccordionTrigger className="p-6">
            <div className="flex items-center gap-3">
                <Recycle className="h-6 w-6 text-primary" />
                <div>
                    <h3 className="font-headline text-lg">Material & Circularity</h3>
                    <p className="text-sm text-muted-foreground font-normal">Composition, recycled content, and end-of-life information.</p>
                </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
             <DetailRow icon={Recycle} label="Recycled Content" value={`${data.materialAndCircularity.recycledContentPercentage}%`} />
             <DetailRow icon={Wrench} label="Reparability Score" value={`${data.materialAndCircularity.reparabilityScore} / 10`} />
             <DetailRow icon={Sprout} label="Dismantling Instructions" value={<a href={data.materialAndCircularity.dismantlingInstructionsUrl} target="_blank" className="text-primary hover:underline">View Guide</a>} />
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Material Composition</h4>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Origin</TableHead>
                            <TableHead>Substance ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.materialAndCircularity.materialComposition.map(mat => (
                            <TableRow key={mat.material}>
                                <TableCell className="font-medium">{mat.material} {mat.isHazardous && <Badge variant="destructive" className="ml-2">!</Badge>}</TableCell>
                                <TableCell>{mat.percentage}%</TableCell>
                                <TableCell>{mat.originCountry}</TableCell>
                                <TableCell className="font-mono text-xs">{mat.substanceId || "N/A"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5" className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <AccordionTrigger className="p-6">
            <div className="flex items-center gap-3">
              <Leaf className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-headline text-lg">Lifecycle & Performance</h3>
                <p className="text-sm text-muted-foreground font-normal">Warranty, lifetime, and environmental impact data.</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
              <DetailRow icon={Calendar} label="Warranty" value={data.lifecycleAndPerformance.warrantyPeriod} />
              <DetailRow icon={Zap} label="Expected Lifetime" value={data.lifecycleAndPerformance.expectedLifetime} />
              <DetailRow icon={Leaf} label="State of Health" value={data.lifecycleAndPerformance.stateOfHealth} />
              <DetailRow icon={Footprints} label="Carbon Footprint" value={data.lifecycleAndPerformance.carbonFootprint} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
        
      {data.digitalSignature && (
        <Card>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <Lock className="h-6 w-6 text-green-500" />
            <div>
              <CardTitle className="font-headline text-lg">Digitally Signed</CardTitle>
              <CardDescription>This passport's integrity has been cryptographically verified.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pl-16">
            <div className="text-sm space-y-1">
              <p><span className="font-semibold">Signed By:</span> {data.digitalSignature.signedBy}</p>
              {signedAt && <p><span className="font-semibold">Date:</span> {signedAt}</p>}
              <p><span className="font-semibold">Method:</span> {data.digitalSignature.method}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
    </TooltipProvider>
  );
}
