
"use client";

import { useState, useMemo } from "react";
import type { Supplier, SupplierScore } from "@/lib/types";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldCheck, Clock, CheckCircle, Trophy, BarChart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

interface ScoreboardClientProps {
  suppliers: Supplier[];
  scores: SupplierScore[];
}

type CombinedScore = Supplier & SupplierScore;

const badgeConfig: Record<SupplierScore['badge'], { variant: "default" | "secondary" | "destructive", icon: React.ElementType, color: string }> = {
  Gold: { variant: 'default', icon: Trophy, color: 'text-chart-3' },
  Silver: { variant: 'secondary', icon: Trophy, color: 'text-muted-foreground' },
  Bronze: { variant: 'secondary', icon: Trophy, color: 'text-yellow-600' }, // custom color ok for bronze
  Verified: { variant: 'default', icon: CheckCircle, color: 'text-green-500' },
  Incomplete: { variant: 'destructive', icon: Info, color: 'text-destructive' },
};

const barChartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;


export function SupplierScoreboardClient({ suppliers, scores }: ScoreboardClientProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<CombinedScore | null>(null);

  const combinedData = useMemo(() => {
    const scoreMap = new Map(scores.map(s => [s.supplier_id, s]));
    return suppliers
      .map(supplier => {
        const scoreData = scoreMap.get(supplier.supplier_id);
        return scoreData ? { ...supplier, ...scoreData } : null;
      })
      .filter((item): item is CombinedScore => item !== null)
      .sort((a, b) => b.overall_score - a.overall_score);
  }, [suppliers, scores]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-yellow-500";
    return "bg-destructive";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reputation Rankings</CardTitle>
        <CardDescription>Suppliers are ranked by their overall reputation score.</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Overall Score</TableHead>
                <TableHead className="text-center">Compliance</TableHead>
                <TableHead className="text-center">Responsiveness</TableHead>
                <TableHead className="text-center">Verification Rate</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combinedData.map((item, index) => {
                  const config = badgeConfig[item.badge];
                  return (
                    <TableRow key={item.supplier_id}>
                        <TableCell className="font-bold text-lg text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.legal_entity_name}</TableCell>
                        <TableCell>
                            <Badge variant={config.variant} className="gap-1.5">
                              {(() => {
                                const Icon = config.icon;
                                return <Icon className={config.color} />;
                              })()}
                                {item.badge}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Progress value={item.overall_score} className="w-24 h-2" indicatorClassName={getScoreColor(item.overall_score)} />
                                <span className="font-semibold">{item.overall_score}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-center">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="flex items-center justify-center gap-1"><ShieldCheck className="h-4 w-4 text-chart-1" /> {item.compliance_score}</span>
                                </TooltipTrigger>
                                <TooltipContent><p>DPP completeness & certificate coverage.</p></TooltipContent>
                            </Tooltip>
                        </TableCell>
                        <TableCell className="text-center">
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="flex items-center justify-center gap-1"><Clock className="h-4 w-4 text-chart-3" /> {item.responsiveness_score}</span>
                                </TooltipTrigger>
                                <TooltipContent><p>Speed of response to data requests.</p></TooltipContent>
                            </Tooltip>
                        </TableCell>
                        <TableCell className="text-center">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <span className="flex items-center justify-center gap-1"><CheckCircle className="h-4 w-4 text-chart-2" /> {item.verification_rate}%</span>
                                </TooltipTrigger>
                                <TooltipContent><p>Percentage of claims that are 3rd-party verified.</p></TooltipContent>
                            </Tooltip>
                        </TableCell>
                        <TableCell className="text-right">
                           <Dialog>
                             <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedSupplier(item)}>
                                    <BarChart /> View History
                                </Button>
                             </DialogTrigger>
                             {selectedSupplier?.supplier_id === item.supplier_id && (
                             <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Score History: {selectedSupplier.legal_entity_name}</DialogTitle>
                                    <DialogDescription>Overall reputation score over the past few months.</DialogDescription>
                                </DialogHeader>
                                <div className="h-64 w-full py-4">
                                     <ChartContainer config={barChartConfig} className="h-full w-full">
                                        <ResponsiveContainer>
                                            <RechartsBarChart data={selectedSupplier.score_history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8}/>
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                <Bar dataKey="score" fill="var(--color-score)" radius={4} />
                                            </RechartsBarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
                                </DialogFooter>
                            </DialogContent>
                            )}
                           </Dialog>
                        </TableCell>
                    </TableRow>
                  )
              })}
            </TableBody>
          </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
