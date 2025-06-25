

"use client";

import { useState, useMemo } from "react";
import type { Supplier, Module, CompanyModuleAccess, SubscriptionPlan, CompanySubscription } from "@/lib/types";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Blocks, Lock } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./ui/tooltip";


interface ModuleAccessClientProps {
  companies: Supplier[];
  modules: Module[];
  plans: SubscriptionPlan[];
  subscriptions: CompanySubscription[];
  initialAccessRecords: CompanyModuleAccess[];
}

export function ModuleAccessManagementClient({ companies, modules, plans, subscriptions, initialAccessRecords }: ModuleAccessClientProps) {
  const { toast } = useToast();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [accessRecords, setAccessRecords] = useState<CompanyModuleAccess[]>(initialAccessRecords);

  const moduleCategories = useMemo(() => {
    return modules.reduce((acc, module) => {
      const category = module.category || 'General';
      if (!acc[category]) {
          acc[category] = [];
      }
      acc[category].push(module);
      return acc;
    }, {} as Record<string, Module[]>);
  }, [modules]);

  const companyAccessMap = useMemo(() => {
    if (!selectedCompanyId) return new Map<string, boolean>();
    const companyRecords = accessRecords.filter(ar => ar.company_id === selectedCompanyId);
    return new Map(companyRecords.map(ar => [ar.module_id, ar.status === 'active']));
  }, [selectedCompanyId, accessRecords]);
  
  const moduleMap = useMemo(() => new Map(modules.map(m => [m.id, m])), [modules]);
  const planMap = useMemo(() => new Map(plans.map(p => [p.plan_id, p])), [plans]);
  
  const companySubscription = useMemo(() => {
    if (!selectedCompanyId) return null;
    return subscriptions.find(s => s.company_id === selectedCompanyId);
  }, [selectedCompanyId, subscriptions]);

  const companyPlan = useMemo(() => {
    if (!companySubscription) return null;
    return planMap.get(companySubscription.plan_id);
  }, [companySubscription, planMap]);


  const handleAccessChange = (moduleId: string, newStatus: boolean) => {
    if (!selectedCompanyId) return;
    
    setAccessRecords(prevRecords => {
      const existingRecordIndex = prevRecords.findIndex(r => r.company_id === selectedCompanyId && r.module_id === moduleId);
      const newRecords = [...prevRecords];

      if (existingRecordIndex > -1) {
        newRecords[existingRecordIndex] = { ...newRecords[existingRecordIndex], status: newStatus ? 'active' : 'inactive' };
      } else {
        newRecords.push({ company_id: selectedCompanyId, module_id: moduleId, status: newStatus ? 'active' : 'inactive' });
      }
      return newRecords;
    });

    toast({
      title: "Access Updated",
      description: `Permission for ${moduleMap.get(moduleId)?.name} has been set to ${newStatus ? 'Active' : 'Inactive'}.`,
    });
  };

  const selectedCompany = companies.find(c => c.supplier_id === selectedCompanyId);

  return (
    <TooltipProvider>
    <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle>Select Company</CardTitle>
                <CardDescription>Choose a company to configure their module access.</CardDescription>
            </CardHeader>
            <CardContent>
                <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
                    <SelectTrigger><SelectValue placeholder="Select a company..." /></SelectTrigger>
                    <SelectContent>
                        {companies.map(c => <SelectItem key={c.supplier_id} value={c.supplier_id}>{c.legal_entity_name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 {companyPlan && (
                    <div className="mt-4 rounded-lg border bg-background p-3 text-sm">
                        <p className="font-semibold text-muted-foreground">Subscription Plan</p>
                        <p className="text-base font-bold text-primary">{companyPlan.plan_name}</p>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Module Permissions</CardTitle>
                <CardDescription>
                    {selectedCompany ? `Configure permissions for ${selectedCompany.legal_entity_name}.` : "Select a company to see their permissions."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {selectedCompanyId ? (
                    <div className="space-y-6">
                        {Object.entries(moduleCategories).map(([category, modulesInCategory]) => (
                             <div key={category}>
                                <h4 className="text-md font-semibold mb-2">{category}</h4>
                                <div className="space-y-4 rounded-lg border p-4">
                                {modulesInCategory.map(module => {
                                    const isEnabled = companyAccessMap.get(module.id) ?? false;
                                    const dependenciesMet = module.dependencies.every(depId => companyAccessMap.get(depId) ?? false);
                                    const isInPlan = companyPlan?.default_modules.includes(module.id) ?? false;
                                    const isToggleDisabled = !dependenciesMet || !isInPlan;
                                    
                                    return (
                                        <div key={module.id} className="flex items-start justify-between">
                                            <div className="flex-1 pr-4">
                                                <div className="flex items-center gap-2">
                                                    {isInPlan ? <Blocks className="h-5 w-5 text-primary"/> : <Lock className="h-5 w-5 text-muted-foreground"/> }
                                                    <Label htmlFor={`switch-${module.id}`} className="font-semibold">{module.name}</Label>
                                                </div>
                                                <p className="text-sm text-muted-foreground ml-7">{module.description}</p>
                                                {module.dependencies.length > 0 && (
                                                    <div className="text-xs text-muted-foreground ml-7 mt-1 flex items-center gap-1">
                                                        {dependenciesMet ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-yellow-500" />}
                                                        <span>Requires: {module.dependencies.map(d => moduleMap.get(d)?.name).join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                  {/* Wrap switch in a div for tooltip to work on disabled elements */}
                                                  <div>
                                                    <Switch
                                                        id={`switch-${module.id}`}
                                                        checked={isEnabled && !isToggleDisabled}
                                                        onCheckedChange={(checked) => handleAccessChange(module.id, checked)}
                                                        disabled={isToggleDisabled}
                                                        aria-label={`Toggle ${module.name}`}
                                                    />
                                                  </div>
                                                </TooltipTrigger>
                                                {!isInPlan && (
                                                    <TooltipContent>
                                                        <p>This module is not included in the current plan.</p>
                                                    </TooltipContent>
                                                )}
                                                {!dependenciesMet && !isInPlan &&(
                                                    <TooltipContent>
                                                        <p>Enable required dependency modules first.</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </div>
                                    );
                                })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        <p>Please select a company to manage their permissions.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
    </TooltipProvider>
  );
}
