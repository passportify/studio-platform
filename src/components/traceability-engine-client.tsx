
"use client";

import { useState, useMemo } from "react";
import type { Product, Supplier, TraceabilityRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { mockAllProducts, mockAllEntities, mockTraceabilityData } from "@/lib/mock-data";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Share2, CornerDownRight, ChevronDown, ChevronRight, CheckCircle, FileClock, XCircle, CircleHelp, Mail } from "lucide-react";


type ComplianceStatus = TraceabilityRecord['compliance_status'];

const statusConfig: Record<ComplianceStatus, { icon: React.ElementType, color: string, badge: "default" | "secondary" | "destructive" }> = {
    Verified: { icon: CheckCircle, color: 'text-green-600', badge: 'default' },
    Pending: { icon: FileClock, color: 'text-yellow-600', badge: 'secondary' },
    Rejected: { icon: XCircle, color: 'text-red-600', badge: 'destructive' },
    Invited: { icon: Mail, color: 'text-blue-600', badge: 'secondary' },
};

const SupplyChainNode = ({ node, allNodes, supplierMap, onStatusChange, level = 0 }: { node: TraceabilityRecord, allNodes: TraceabilityRecord[], supplierMap: Map<string, string>, onStatusChange: (id: string, status: ComplianceStatus) => void, level?: number }) => {
  const [isOpen, setIsOpen] = useState(level < 2);
  const children = allNodes.filter(n => n.parent_trace_id === node.trace_id);
  const config = statusConfig[node.compliance_status] || { icon: CircleHelp, color: 'text-gray-500', badge: 'secondary' };

  return (
    <div className={cn(level > 0 && "pl-4")}>
        <div className="flex items-center gap-2 py-2 rounded-md hover:bg-muted/50 pr-2 group">
            {children.length > 0 ? (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                </Button>
            ) : (
                <div className="w-6 h-6 flex items-center justify-center">
                    <CornerDownRight className="h-4 w-4 text-muted-foreground/50"/>
                </div>
            )}
            <config.icon className={cn("h-5 w-5 shrink-0", config.color)} />
            <div className="flex-1">
                <p className="font-semibold">{node.material_name} <span className="font-normal text-muted-foreground">({node.quantity}{node.quantity_unit})</span></p>
                <p className="text-xs text-muted-foreground">
                    Supplier: <span className="font-medium text-foreground">{supplierMap.get(node.supplier_id) || 'Unknown'}</span> | Origin: {node.origin_country} | Tier {node.tier}
                </p>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {node.compliance_status === 'Pending' && (
                        <>
                            <DropdownMenuItem onClick={() => onStatusChange(node.trace_id, 'Verified')}><CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Force Approve</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange(node.trace_id, 'Rejected')} className="text-destructive"><XCircle className="mr-2 h-4 w-4"/> Reject Submission</DropdownMenuItem>
                        </>
                    )}
                     {node.compliance_status === 'Invited' && (
                        <DropdownMenuItem><Mail className="mr-2 h-4 w-4"/> Resend Invite</DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        {isOpen && children.map(child => (
            <SupplyChainNode key={child.trace_id} node={child} allNodes={allNodes} supplierMap={supplierMap} level={level + 1} onStatusChange={onStatusChange} />
        ))}
    </div>
  );
};


export function TraceabilityEngineClient() {
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [records, setRecords] = useState<TraceabilityRecord[]>(mockTraceabilityData);
  
  const supplierMap = useMemo(() => new Map(mockAllEntities.map(s => [s.supplier_id, s.legal_entity_name])), []);
  
  const { filteredRecords, recordTree } = useMemo(() => {
    if (!selectedProductId) return { filteredRecords: [], recordTree: [] };
    const filtered = records.filter(r => r.product_id === selectedProductId);
    const tree = filtered.filter(r => !r.parent_trace_id);
    return { filteredRecords: filtered, recordTree: tree };
  }, [records, selectedProductId]);

  const handleUpdateStatus = (traceId: string, status: ComplianceStatus) => {
    setRecords(prev => prev.map(rec => rec.trace_id === traceId ? { ...rec, compliance_status: status } : rec));
    toast({ title: `Record status updated to ${status}` });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Select a Product</CardTitle>
          <Select onValueChange={setSelectedProductId} value={selectedProductId}>
            <SelectTrigger><SelectValue placeholder="Select a product to view its traceability graph..." /></SelectTrigger>
            <SelectContent>
              {mockAllProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        {selectedProductId && (
          <CardContent>
             {recordTree.length > 0 ? (
                <div className="space-y-1 rounded-lg border p-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><Share2 className="text-primary"/> Supply Chain Graph</h3>
                  {recordTree.map(node => <SupplyChainNode key={node.trace_id} node={node} allNodes={filteredRecords} supplierMap={supplierMap} onStatusChange={handleUpdateStatus} />)}
                </div>
              ) : (
                <div className="text-center h-24 flex items-center justify-center text-muted-foreground border rounded-lg">No traceability data to display for this product.</div>
              )}
          </CardContent>
        )}
      </Card>
    </>
  );
}
