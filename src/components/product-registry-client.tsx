
"use client";

import { useState, useMemo } from "react";
import type { CompanyProduct, Supplier } from "@/lib/types";
import { mockAllProducts, mockSuppliers } from "@/lib/mock-data";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "./ui/input";

type ProductStatus = "Approved" | "Draft" | "Submitted" | "Rejected";

const statusConfig: Record<ProductStatus, { variant: "default" | "secondary" | "destructive" }> = {
    Approved: { variant: "default" },
    Submitted: { variant: "secondary" },
    Draft: { variant: "secondary" },
    Rejected: { variant: "destructive" },
};

export function ProductRegistryClient() {
  const [products] = useState<CompanyProduct[]>(mockAllProducts);
  const [filter, setFilter] = useState('');

  const supplierMap = useMemo(() => new Map(mockSuppliers.map(s => [s.supplier_id, s.legal_entity_name])), []);
  
  const filteredProducts = useMemo(() => {
    if (!filter) return products;
    return products.filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.companyName?.toLowerCase().includes(filter.toLowerCase()) ||
        p.status.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter, products]);

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline">All Products</CardTitle>
                    <CardDescription>A complete list of all products across all companies on the platform.</CardDescription>
                </div>
                <div className="w-full max-w-sm">
                     <Input 
                        placeholder="Filter by product name, company..."
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
              <TableHead>Product Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>DPP Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.companyName || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant={statusConfig[product.status as ProductStatus].variant}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>{product.version}</TableCell>
                <TableCell>{product.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
