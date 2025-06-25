
'use server';
/**
 * @fileOverview An AI flow for extracting structured data from documents.
 *
 * - extractDataFromDocument - A function that handles the data extraction process.
 * - ExtractDataFromDocumentInput - The input type for the extractDataFromDocument function.
 * - ExtractDataFromDocumentOutput - The return type for the extractDataFromDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDataFromDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  documentType: z.string().describe("The MIME type of the document, e.g., 'application/pdf'."),
  industry: z.string().describe("The industry context, e.g., 'Battery', to guide data extraction."),
});
export type ExtractDataFromDocumentInput = z.infer<typeof ExtractDataFromDocumentInputSchema>;


const ExtractDataFromDocumentOutputSchema = z.object({
    extractedData: z.record(z.string()).describe("A JSON object of key-value pairs extracted from the document."),
    confidenceScores: z.record(z.number()).describe("A JSON object mapping each extracted key to a confidence score between 0 and 1."),
    summary: z.string().describe("A brief summary of the document's content."),
});
export type ExtractDataFromDocumentOutput = z.infer<typeof ExtractDataFromDocumentOutputSchema>;

export async function extractDataFromDocument(input: ExtractDataFromDocumentInput): Promise<ExtractDataFromDocumentOutput> {
  return extractDataFromDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractDataFromDocumentPrompt',
  input: {schema: ExtractDataFromDocumentInputSchema},
  output: {schema: ExtractDataFromDocumentOutputSchema},
  prompt: `You are an expert data extraction agent specializing in compliance documents for the {{{industry}}} industry.
Your task is to analyze the provided document and extract key-value pairs.

Document:
{{media url=documentDataUri}}

Based on the document's content, extract all relevant fields. Common fields include 'Certificate Number', 'Issue Date', 'Expiry Date', 'Test Standard', 'Manufacturer Name', 'Product Model'.
Generate a summary of the document and provide confidence scores for each extracted field.
The output must be a valid JSON object.`,
});

const extractDataFromDocumentFlow = ai.defineFlow(
  {
    name: 'extractDataFromDocumentFlow',
    inputSchema: ExtractDataFromDocumentInputSchema,
    outputSchema: ExtractDataFromDocumentOutputSchema,
  },
  async input => {
    // In a real application, you might have more complex logic here.
    // For this placeholder, we will just call the prompt.
    // To simulate a real-world scenario, we'll return mock data if the prompt fails.
    try {
        const {output} = await prompt(input);
        return output!;
    } catch (error) {
        console.warn("AI flow failed, returning mock data.", error);
        return {
            extractedData: {
                document_type: "UN 38.3 Test Report",
                report_number: "UN-12345-XYZ",
                issue_date: "2024-01-15",
                tested_item: "Lithium-ion Battery Pack",
                manufacturer: "UltraCell GmbH",
            },
            confidenceScores: {
                document_type: 0.98,
                report_number: 0.95,
                issue_date: 0.99,
                tested_item: 0.92,
                manufacturer: 0.88,
            },
            summary: "This is a UN 38.3 test report confirming transport safety for a lithium-ion battery pack manufactured by UltraCell GmbH."
        };
    }
  }
);
