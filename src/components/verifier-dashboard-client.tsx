"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileClock, CheckCircle, XCircle, FileSearch } from "lucide-react";

interface VerifierDashboardClientProps {
  stats: {
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
  };
}

export function VerifierDashboardClient({ stats }: VerifierDashboardClientProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Queue</CardTitle>
          <FileClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
          <p className="text-xs text-muted-foreground">New tasks awaiting review.</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Currently In Review</CardTitle>
          <FileSearch className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inReview}</div>
          <p className="text-xs text-muted-foreground">Tasks you are actively reviewing.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approved}</div>
          <p className="text-xs text-muted-foreground">Successfully verified tasks this month.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Rejected</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.rejected}</div>
          <p className="text-xs text-muted-foreground">Rejected tasks this month.</p>
        </CardContent>
      </Card>
    </div>
  );
}
