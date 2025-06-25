
"use client";

import { useState, useMemo } from "react";
import type { MaterialSpecification, Supplier } from "@/lib/types";
import { mockAllMaterials, mockSuppliers } from "@/lib/mock-data";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "./ui/input";

export function MaterialRegistryClient() {
  const [materials] = useState<MaterialSpecification[]>(mockAllMaterials);
  const [filter, setFilter] = useState('');

  const supplierMap = useMemo(() => new Map(mockSuppliers.map(s => [s.supplier_id, s.legal_entity_name])), []);
  
  const filteredMaterials = useMemo(() => {
      if(!filter) return materials;
      return materials.filter(mat => 
        mat.material_name.toLowerCase().includes(filter.toLowerCase()) ||
        supplierMap.get(mat.supplier_id)?.toLowerCase().includes(filter.toLowerCase()) ||
        mat.material_type.toLowerCase().includes(filter.toLowerCase())
      );
  }, [filter, materials, supplierMap]);


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">All Materials</CardTitle>
                <CardDescription>A complete list of all materials defined across all supplier libraries.</CardDescription>
            </div>
            <div className="w-full max-w-sm">
                <Input 
                    placeholder="Filter by material name, supplier..."
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
              <TableHead>Material Name</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.map((material) => (
              <TableRow key={material.material_id}>
                <TableCell className="font-medium">{material.material_name}</TableCell>
                <TableCell>{supplierMap.get(material.supplier_id)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{material.material_type}</Badge>
                </TableCell>
                <TableCell className="max-w-sm truncate">{material.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
