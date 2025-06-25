
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import type { Document } from "@/lib/types";
import { mockAllCertificates, mockAllProducts, mockSuppliers } from "@/lib/mock-data";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Input } from "./ui/input";

export function CertificateRegistryClient() {
  const [documents] = useState<Document[]>(mockAllCertificates);
  const [filter, setFilter] = useState('');

  const productMap = useMemo(() => new Map(mockAllProducts.map(p => [p.id, p.name])), []);
  const supplierMap = useMemo(() => new Map(mockSuppliers.map(s => [s.supplier_id, s.legal_entity_name])), []);

  const statusConfig: Record<Document['human_verification_status'], { color: "default" | "secondary" | "destructive"; icon: React.ElementType }> = {
    Pending: { color: "secondary", icon: FileText },
    Verified: { color: "default", icon: CheckCircle2 },
    Rejected: { color: "destructive", icon: XCircle },
    Escalated: { color: "destructive", icon: AlertTriangle },
  };

  const filteredDocuments = useMemo(() => {
    if (!filter) return documents;
    return documents.filter(doc => 
        doc.file_name.toLowerCase().includes(filter.toLowerCase()) ||
        productMap.get(doc.product_id)?.toLowerCase().includes(filter.toLowerCase()) ||
        supplierMap.get(doc.supplier_id)?.toLowerCase().includes(filter.toLowerCase()) ||
        doc.document_type.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter, documents, productMap, supplierMap]);


  return (
    <Card>
        <CardHeader>
             <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline">All Certificates</CardTitle>
                    <CardDescription>A complete list of all compliance documents on the platform.</CardDescription>
                </div>
                <div className="w-full max-w-sm">
                    <Input 
                        placeholder="Filter by name, product, company..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
             </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => {
                const status = statusConfig[doc.human_verification_status];
                return (
                    <TableRow key={doc.document_id}>
                    <TableCell className="font-medium">{doc.file_name}</TableCell>
                    <TableCell>{productMap.get(doc.product_id) || "Unknown Product"}</TableCell>
                    <TableCell>{supplierMap.get(doc.supplier_id) || "Unknown Supplier"}</TableCell>
                    <TableCell>{doc.document_type}</TableCell>
                    <TableCell>{format(new Date(doc.upload_date), "PPp")}</TableCell>
                    <TableCell>
                        <Badge variant={status.color} className="gap-1">
                            <status.icon className="h-3 w-3" />
                            {doc.human_verification_status}
                        </Badge>
                    </TableCell>
                    </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  );
}
