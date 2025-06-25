
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { AuditLog, ChangeLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import { mockCompanyAuditLogs, mockCompanyChangeLogs, mockEntityNames } from "@/lib/mock-data";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Bot, User, Globe, FilePlus2, Pencil, ArrowRight, Upload, Check, LinkIcon } from "lucide-react";

type FormattedAuditLog = AuditLog & { formattedTimestamp?: string };
type FormattedChangeLog = ChangeLog & { formattedTimestamp?: string };


export function CompanyAuditTrailClient() {
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [selectedEventLog, setSelectedEventLog] = useState<AuditLog | null>(null);

  const [isChangeDetailsOpen, setIsChangeDetailsOpen] = useState(false);
  const [selectedChangeLog, setSelectedChangeLog] = useState<ChangeLog | null>(null);
  
  const [clientAuditLogs, setClientAuditLogs] = useState<FormattedAuditLog[]>(mockCompanyAuditLogs);
  const [clientChangeLogs, setClientChangeLogs] = useState<FormattedChangeLog[]>(mockCompanyChangeLogs);

  useEffect(() => {
    setClientAuditLogs(
        mockCompanyAuditLogs.map(log => ({
            ...log,
            formattedTimestamp: format(new Date(log.timestamp), "PPp"),
        }))
    );
     setClientChangeLogs(
        mockCompanyChangeLogs.map(log => ({
            ...log,
            formattedTimestamp: format(new Date(log.timestamp), "PPp"),
        }))
    );
  }, []);

  const eventConfig: Record<string, { icon: React.ElementType, color: string, badge: "default" | "secondary" | "destructive" }> = {
    Create: { icon: FilePlus2, color: 'text-blue-500', badge: "default" },
    Update: { icon: Pencil, color: 'text-yellow-500', badge: "secondary" },
    Upload: { icon: Upload, color: 'text-sky-500', badge: "secondary" },
    Approval: { icon: Check, color: 'text-green-500', badge: "default" },
  };

  const actorConfig: Record<AuditLog['actor_role'], { icon: React.ElementType }> = {
    Admin: { icon: User },
    Supplier: { icon: User },
    Auditor: { icon: User },
    System: { icon: Bot },
    Public: { icon: Globe },
  };

  const handleViewEventDetails = (log: AuditLog) => {
    setSelectedEventLog(log);
    setIsEventDetailsOpen(true);
  };
  
  const handleViewChangeDetails = (log: ChangeLog) => {
    setSelectedChangeLog(log);
    setIsChangeDetailsOpen(true);
  };

  const formatFieldValue = (value: any) => {
    if (value === null || value === undefined) return <span className="text-muted-foreground italic">Not set</span>;
    if (typeof value === 'boolean') return value ? 'True' : 'False';
    return String(value);
  };

  return (
    <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Event Log</TabsTrigger>
            <TabsTrigger value="changes">Data Change Log</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Company Event Log</CardTitle>
                <CardDescription>Chronological record of all major actions performed by your organization.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {clientAuditLogs.map((log) => {
                        const config = eventConfig[log.event_type] || { icon: FilePlus2, color: 'text-gray-500', badge: 'secondary' };
                        const ActorIcon = actorConfig[log.actor_role].icon;
                        return (
                            <TableRow key={log.log_id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <config.icon className={cn("h-4 w-4", config.color)} />
                                        <div>
                                            <p className="font-medium">{log.event_type.replace('_', ' ')}</p>
                                            <p className="text-xs text-muted-foreground">{log.related_entity_type}: {mockEntityNames[log.related_entity_id || ''] || log.related_entity_id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <ActorIcon className="h-4 w-4 text-muted-foreground" />
                                        <span>{log.actor_role}</span>
                                        <span className="text-xs text-muted-foreground">({log.actor_id})</span>
                                    </div>
                                </TableCell>
                                <TableCell>{log.formattedTimestamp}</TableCell>
                                <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleViewEventDetails(log)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="changes">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Product Change Log</CardTitle>
                <CardDescription>Detailed history of data modifications for each product version.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Changed By</TableHead>
                        <TableHead>Change Reason</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {clientChangeLogs.map((log) => (
                        <TableRow key={log.log_id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{mockEntityNames[log.product_id] || log.product_id}</span>
                                    <span className="text-xs text-muted-foreground font-mono">{log.version_id}</span>
                                </div>
                            </TableCell>
                            <TableCell>{log.changed_by}</TableCell>
                            <TableCell className="max-w-[300px] truncate">{log.change_reason}</TableCell>
                            <TableCell>{log.formattedTimestamp}</TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleViewChangeDetails(log)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Changes
                            </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>

      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Log Event Details</DialogTitle>
            <DialogDescription>
              Details for log <span className="font-mono bg-muted px-1 py-0.5 rounded-sm">{selectedEventLog?.log_id}</span>
            </DialogDescription>
          </DialogHeader>
          {selectedEventLog && (
            <div className="grid gap-6 py-4 text-sm max-h-[70vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><span className="font-medium text-muted-foreground block">Event Type:</span> {selectedEventLog.event_type}</div>
                  <div><span className="font-medium text-muted-foreground block">Product:</span> {mockEntityNames[selectedEventLog.product_id] || selectedEventLog.product_id}</div>
                  <div><span className="font-medium text-muted-foreground block">Timestamp:</span> {format(new Date(selectedEventLog.timestamp), "PPp")}</div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><span className="font-medium text-muted-foreground block">Actor Role:</span> {selectedEventLog.actor_role}</div>
                  <div><span className="font-medium text-muted-foreground block">Actor ID:</span> {selectedEventLog.actor_id}</div>
                  <div><span className="font-medium text-muted-foreground block">Channel:</span> {selectedEventLog.event_channel}</div>
              </div>
              
              <div>
                <p className="font-medium text-muted-foreground mb-2">Event Context</p>
                <div className="rounded-md border bg-muted/50 p-4 space-y-2">
                    {Object.entries(selectedEventLog.event_context).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-[150px_1fr] items-start">
                            <span className="font-semibold capitalize text-card-foreground">{key.replace(/_/g, ' ')}:</span>
                            <span className="break-words">{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isChangeDetailsOpen} onOpenChange={setIsChangeDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Product Change Details</DialogTitle>
             <DialogDescription>
              Changes for version <span className="font-mono bg-muted px-1 py-0.5 rounded-sm">{selectedChangeLog?.version_id}</span>
            </DialogDescription>
          </DialogHeader>
          {selectedChangeLog && (
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="rounded-md border bg-muted/50 p-4 space-y-4">
                    {Object.entries(selectedChangeLog.changes).map(([field, values]) => (
                        <div key={field}>
                            <p className="font-semibold capitalize mb-1">{field.replace(/_/g, ' ')}</p>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="flex-1 bg-background p-2 rounded-md border border-red-200 text-red-800 line-through">
                                    {formatFieldValue(values.before)}
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                                <div className="flex-1 bg-green-50 p-2 rounded-md border border-green-200 text-green-800">
                                    {formatFieldValue(values.after)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Change Reason:</p>
                  <p className="text-sm mt-1">{selectedChangeLog.change_reason}</p>
                </div>
            </div>
          )}
           <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
