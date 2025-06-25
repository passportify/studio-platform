
"use client";

import { useState, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  File as FileIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  FileSearch,
  Wand2,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { extractDataFromDocument, type ExtractDataFromDocumentOutput } from "@/ai/flows/document-intelligence";
import { reviewExtractedData } from "@/ai/flows/human-in-the-loop-review";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

type ReviewFormSchema = z.infer<z.ZodType<any, any>>;

export function CompanyDocumentAiClient() {
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractDataFromDocumentOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  
  const reviewFormSchema = useMemo(() => {
    if (!extractedData?.extractedData) return z.object({});
    const shape = Object.keys(extractedData.extractedData).reduce((acc, key) => {
      acc[key] = z.string().optional();
      return acc;
    }, {} as Record<string, z.ZodTypeAny>);
    return z.object(shape);
  }, [extractedData]);

  const form = useForm<ReviewFormSchema>({
    resolver: zodResolver(reviewFormSchema),
    values: extractedData?.extractedData,
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setExtractedData(null);
      form.reset({});
      try {
        const uri = await fileToDataUri(selectedFile);
        setFileDataUri(uri);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error reading file' });
        console.error(error);
      }
    }
  }, [toast, form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
    multiple: false,
  });
  
  const handleProcessFile = async () => {
    if (!fileDataUri || !file) return;

    setIsProcessing(true);
    setExtractedData(null);
    form.reset({});
    
    try {
        const result = await extractDataFromDocument({
            documentDataUri: fileDataUri,
            documentType: file.type,
            industry: "Battery", // This could be dynamic in a real app
        });
        setExtractedData(result);
        form.reset(result.extractedData);
        toast({ title: 'Extraction Complete', description: 'Review the extracted data below.' });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Extraction Failed', description: 'Could not process the document.' });
    } finally {
        setIsProcessing(false);
    }
  };

  const onReviewSubmit = async (data: ReviewFormSchema) => {
    if (!extractedData) return;
    setIsSubmitting(true);
    try {
        await reviewExtractedData({
            documentId: file?.name || 'unknown',
            aiExtractedData: extractedData.extractedData,
            humanCorrectedData: data,
            reviewStatus: 'Approved',
            reviewerId: 'user_company_01', // Mocked user
        });

        toast({ title: 'Data Validated!', description: 'The corrected data has been saved as the ground truth.' });
        setFile(null);
        setFileDataUri(null);
        setExtractedData(null);
        form.reset({});

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Submission Failed' });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>1. Upload Document</CardTitle>
                    <CardDescription>Drag and drop a file or click to upload.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div {...getRootProps()} className={`p-8 text-center rounded-md border-2 border-dashed  transition-colors ${isDragActive ? 'border-primary bg-muted/50' : 'hover:border-primary hover:bg-muted/50'}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-semibold">
                        {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">or click to select a file</p>
                    </div>
                     {file && (
                        <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                            <div className="flex items-center gap-2 text-sm">
                                <FileIcon className="h-5 w-5 text-muted-foreground" />
                                <span className="font-semibold">{file.name}</span>
                                <span className="text-muted-foreground">({(file.size / 1024).toFixed(2)} KB)</span>
                            </div>
                            <Button onClick={handleProcessFile} disabled={isProcessing}>
                                {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : <><Wand2 className="mr-2 h-4 w-4"/> Process with AI</>}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {fileDataUri && (
                <Card>
                     <CardHeader>
                        <CardTitle>Document Viewer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <iframe src={fileDataUri} className="w-full h-[600px] rounded-md border" title="Document Preview"/>
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="sticky top-24 space-y-8">
            <Card>
                <Form {...form}>
                 <form onSubmit={form.handleSubmit(onReviewSubmit)}>
                    <CardHeader>
                        <CardTitle>2. Review & Correct Data</CardTitle>
                        <CardDescription>Verify the data extracted by the AI. Make any corrections needed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isProcessing && (
                             <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                <p className="font-semibold">AI is analyzing your document...</p>
                            </div>
                        )}

                        {extractedData ? (
                            <div className="space-y-4">
                               {Object.entries(extractedData.extractedData).map(([key, value]) => (
                                    <FormField
                                        key={key}
                                        control={form.control}
                                        name={key}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="capitalize">{key.replace(/_/g, ' ')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                               ))}
                                <Alert>
                                    <FileSearch className="h-4 w-4" />
                                    <AlertTitle>Confidence Scores</AlertTitle>
                                    <AlertDescription>
                                        <div className="text-xs space-y-1 mt-2">
                                        {Object.entries(extractedData.confidenceScores).map(([key, score]) => (
                                            <p key={key} className="capitalize">{key.replace(/_/g, ' ')}: <span className="font-semibold">{Number(score || 0 * 100).toFixed(0)}%</span></p>
                                        ))}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        ) : !isProcessing && (
                            <div className="text-center text-muted-foreground py-12">
                                <p>Extracted data will appear here after processing.</p>
                            </div>
                        )}
                    </CardContent>
                    {extractedData && (
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : <><CheckCircle2 className="mr-2 h-4 w-4"/> Approve & Save Data</>}
                            </Button>
                        </CardFooter>
                    )}
                </form>
                </Form>
            </Card>
        </div>
    </div>
  );
}
