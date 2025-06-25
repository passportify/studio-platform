
"use client";

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

import type { Product, QRCodeLog } from '@/lib/types';
import { generateQRCodeAction } from '@/app/superadmin/qr-code-engine/actions';
import { mockAllProducts } from '@/lib/mock-data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, QrCode, Eye } from 'lucide-react';

const generateFormSchema = z.object({
  productId: z.string({ required_error: 'Please select a product.' }),
});

type GenerateFormData = z.infer<typeof generateFormSchema>;

export function QRCodeEngineClient() {
  const { toast } = useToast();
  const [qrLogs, setQrLogs] = useState<QRCodeLog[]>([]);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<QRCodeLog | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const productMap = useMemo(() => new Map(mockAllProducts.map(p => [p.id, p.name])), []);
  
  const form = useForm<GenerateFormData>({
    resolver: zodResolver(generateFormSchema),
  });

  const onSubmit = async (data: GenerateFormData) => {
    setIsGenerating(true);
    try {
      const product = mockAllProducts.find(p => p.id === data.productId);
      if (!product) throw new Error("Product not found");

      const result = await generateQRCodeAction({
        productId: product.id,
        versionId: product.version,
      });

      if (result.success && result.data) {
        setQrLogs(prev => [result.data!, ...prev]);
        toast({ title: 'QR Code Generated', description: `Successfully created a QR code for ${product.name}.` });
        setIsGenerateOpen(false);
        form.reset();
      } else {
        throw new Error(result.error || 'Failed to generate QR code.');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewDetails = (log: QRCodeLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">QR Code Log</CardTitle>
              <CardDescription>History of all generated QR codes for your products.</CardDescription>
            </div>
            <Button onClick={() => setIsGenerateOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Generate QR Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Version ID</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrLogs.length > 0 ? (
                qrLogs.map(log => (
                  <TableRow key={log.qr_code_id}>
                    <TableCell className="font-medium">{productMap.get(log.product_id) || 'Unknown Product'}</TableCell>
                    <TableCell className="font-mono text-xs">{log.version_id}</TableCell>
                    <TableCell>{format(new Date(log.last_updated_at), 'PPp')}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'Active' ? 'default' : 'destructive'}>{log.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" onClick={() => handleViewDetails(log)}>
                         <QrCode className="mr-2 h-4 w-4" />
                         View QR
                       </Button>
                       <Button variant="ghost" size="sm" asChild>
                         <Link href={`/view/${log.product_id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="mr-2 h-4 w-4" />
                            View Public
                         </Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <h3 className="mt-4 text-lg font-semibold">No QR Codes Found</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                      Get started by generating your first QR code.
                    </p>
                    <Button onClick={() => setIsGenerateOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Generate QR Code
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">Generate New QR Code</DialogTitle>
            <DialogDescription>Select a product to generate a QR code for its current approved version.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockAllProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">QR Code Details</DialogTitle>
             <DialogDescription>
              QR Code for {productMap.get(selectedLog?.product_id || '') || 'product'}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-white rounded-lg border">
                  <Image data-ai-hint="qr code" src={selectedLog.rendered_image_base64} alt="Generated QR Code" width={256} height={256} />
                </div>
                <div className="w-full text-sm space-y-2">
                    <p><span className="font-semibold">Product:</span> {productMap.get(selectedLog.product_id)}</p>
                    <p><span className="font-semibold">Encoded URL:</span> <a href={selectedLog.qr_code_value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{selectedLog.qr_code_value}</a></p>
                    <p><span className="font-semibold">Version ID:</span> <span className="font-mono text-xs">{selectedLog.version_id}</span></p>
                    <p><span className="font-semibold">Status:</span> {selectedLog.status}</p>
                </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
