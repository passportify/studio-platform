
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Supplier, PrivacyConsent } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Network, FileCheck, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface CompanyPrivacyClientProps {
  suppliers: Supplier[];
  initialConsents: PrivacyConsent[];
}

const permissionConfig = {
  share_full_dpp: {
    label: "Share Full DPP",
    description: "Allows the supplier to view the complete public-facing Digital Product Passport for products they are linked to.",
    icon: ShieldCheck,
  },
  share_traceability_data: {
    label: "Share Traceability Data",
    description: "Allows the supplier to see upstream and downstream traceability information you have linked to them.",
    icon: Network,
  },
  share_compliance_status: {
    label: "Share Compliance Status",
    description: "Allows the supplier to see the real-time compliance status and document checklist for products they supply.",
    icon: FileCheck,
  },
};

export function CompanyPrivacyClient({ suppliers, initialConsents }: CompanyPrivacyClientProps) {
  const { toast } = useToast();
  const [consents, setConsents] = useState<PrivacyConsent[]>(initialConsents);
  
  const supplierNameMap = useMemo(() => new Map(suppliers.map(s => [s.supplier_id, s.legal_entity_name])), [suppliers]);

  const handleConsentChange = useCallback((supplierId: string, permissionKey: keyof PrivacyConsent['permissions'], value: boolean) => {
    let updatedConsents: PrivacyConsent[];
    setConsents(prevConsents => {
      const newConsents = prevConsents.map(consent => {
        if (consent.supplier_id === supplierId) {
          return {
            ...consent,
            permissions: {
              ...consent.permissions,
              [permissionKey]: value,
            },
          };
        }
        return consent;
      });

      // If no consent record exists for the supplier, create one
      if (!newConsents.some(c => c.supplier_id === supplierId)) {
        newConsents.push({
          supplier_id: supplierId,
          permissions: {
            share_full_dpp: false,
            share_traceability_data: false,
            share_compliance_status: false,
            [permissionKey]: value,
          },
        });
      }
      updatedConsents = newConsents;
      return updatedConsents;
    });

    const permissionLabel = permissionConfig[permissionKey].label;
    toast({
        title: "Permission Updated",
        description: `"${permissionLabel}" for ${supplierNameMap.get(supplierId)} set to ${value ? 'Allowed' : 'Denied'}.`
    });
  }, [toast, supplierNameMap]);
  
  const companySuppliers = suppliers.filter(s => s.entity_type === 'Supplier');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Data Sharing</CardTitle>
        <CardDescription>
          Manage data sharing permissions for each supplier in your network. These settings are applied company-wide.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-center">Share DPP</TableHead>
                <TableHead className="text-center">Share Traceability</TableHead>
                <TableHead className="text-center">Share Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companySuppliers.map(supplier => {
                const supplierConsents = consents.find(c => c.supplier_id === supplier.supplier_id)?.permissions || {
                  share_full_dpp: false,
                  share_traceability_data: false,
                  share_compliance_status: false,
                };

                return (
                  <TableRow key={supplier.supplier_id}>
                    <TableCell className="font-medium">{supplier.legal_entity_name}</TableCell>
                    {(Object.keys(permissionConfig) as Array<keyof typeof permissionConfig>).map(key => {
                      const Icon = permissionConfig[key].icon;
                      return (
                      <TableCell key={key} className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-block">
                                <Switch
                                checked={supplierConsents[key]}
                                onCheckedChange={(checked) => handleConsentChange(supplier.supplier_id, key, checked)}
                                aria-label={permissionConfig[key].label}
                                />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex items-center gap-2 p-2 max-w-xs">
                              <Icon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-semibold">{permissionConfig[key].label}</p>
                                    <p className="text-xs text-muted-foreground">{permissionConfig[key].description}</p>
                                </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    )})}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
