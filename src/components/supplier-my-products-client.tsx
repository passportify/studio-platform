
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { mockAssociatedProducts } from '@/lib/mock-data';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, FileInput } from "lucide-react";


type ProductStatus = "Approved" | "Draft" | "Submitted" | "Rejected";
type AssociatedProduct = (typeof mockAssociatedProducts)[0] & {
    lastUpdatedFormatted: string;
};

const statusConfig: Record<ProductStatus, { variant: "default" | "secondary" | "destructive" }> = {
    Approved: { variant: "default" },
    Submitted: { variant: "secondary" },
    Draft: { variant: "secondary" },
    Rejected: { variant: "destructive" },
};

export function SupplierMyProductsClient() {
  const [products, setProducts] = useState<AssociatedProduct[]>([]);
  
  useEffect(() => {
    // Format dates on client side to avoid hydration errors
    setProducts(mockAssociatedProducts.map(p => ({
        ...p,
        lastUpdatedFormatted: format(new Date(p.lastUpdated), "PPp")
    })));
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Requesting Company</TableHead>
              <TableHead>Your Material</TableHead>
              <TableHead>DPP Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.productId + product.materialSupplied}>
                <TableCell className="font-medium">{product.productName}</TableCell>
                <TableCell>{product.requester}</TableCell>
                <TableCell>{product.materialSupplied}</TableCell>
                <TableCell>
                  <Badge variant={statusConfig[product.dppStatus as ProductStatus].variant}>
                    {product.dppStatus}
                  </Badge>
                </TableCell>
                <TableCell>{product.lastUpdatedFormatted}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild disabled={!product.requestId}>
                            <Link href={product.requestId ? `/supplier-portal/data-requests/${product.requestId}` : '#'}>
                                <FileInput className="mr-2 h-4 w-4" /> Manage Data Request
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/view/${product.productId}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" /> View Public DPP
                            </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
