"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import type { VerificationTask } from "@/lib/types";
import { mockVerificationTasks } from "@/lib/mock-data";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileSearch, CheckCircle, XCircle, FileClock } from "lucide-react";

type VerificationStatus = VerificationTask['status'];

const statusConfig: Record<VerificationStatus, { variant: "default" | "secondary" | "destructive", icon: React.ElementType }> = {
    'Pending': { variant: 'secondary', icon: FileClock },
    'In Review': { variant: 'secondary', icon: FileSearch },
    'Approved': { variant: 'default', icon: CheckCircle },
    'Rejected': { variant: 'destructive', icon: XCircle },
};

export function VerifierQueueClient() {
  const [tasks, setTasks] = useState<VerificationTask[]>(mockVerificationTasks);

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Requesting Company</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map(task => {
                const config = statusConfig[task.status];
                return (
                  <TableRow key={task.verification_id}>
                    <TableCell className="font-medium">{task.document_name}</TableCell>
                    <TableCell>{task.product_name}</TableCell>
                    <TableCell>{task.requester_name}</TableCell>
                    <TableCell>{format(new Date(task.submitted_at), "PPP")}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1.5">
                        <config.icon className="size-3.5"/>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" asChild>
                         <Link href={`/verifier-portal/queue/${task.verification_id}`}>
                            Review
                         </Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
