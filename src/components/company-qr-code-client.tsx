
"use client";

import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

import type { QRCodeLog } from '@/lib/types';
import { mockCompanyQrLogs, mockEntityNames } from '@/lib/mock-data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { QrCode, Eye } from 'lucide-react';


type FormattedQRCodeLog = QRCodeLog & {
  formattedDate: string;
};


export function CompanyQrCodeClient() {
  const [clientQrLogs, setClientQrLogs] = useState<FormattedQRCodeLog[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<QRCodeLog | null>(null);
  
  useEffect(() => {
    const formattedLogs = mockCompanyQrLogs.map(log => ({
      ...log,
      formattedDate: format(new Date(log.last_updated_at), 'PPp'),
    }));
    setClientQrLogs(formattedLogs);
  }, []);

  const handleViewDetails = (log: QRCodeLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
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
              {clientQrLogs.length > 0 ? (
                clientQrLogs.map(log => (
                  <TableRow key={log.qr_code_id}>
                    <TableCell className="font-medium">{mockEntityNames[log.product_id] || 'Unknown Product'}</TableCell>
                    <TableCell className="font-mono text-xs">{log.version_id}</TableCell>
                    <TableCell>{log.formattedDate}</TableCell>
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
                    No QR Codes have been generated for your products yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">QR Code Details</DialogTitle>
             <DialogDescription>
              QR Code for {mockEntityNames[selectedLog?.product_id || ''] || 'product'}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-white rounded-lg border">
                  <Image data-ai-hint="qr code" src={selectedLog.rendered_image_base64} alt="Generated QR Code" width={256} height={256} />
                </div>
                <div className="w-full text-sm space-y-2">
                    <p><span className="font-semibold">Product:</span> {mockEntityNames[selectedLog.product_id]}</p>
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
