
'use server';
/**
 * @fileOverview An AI flow to analyze a product's compliance documents against its required rules.
 * 
 * - analyzeProductCompliance - A function that runs a compliance analysis.
 * - ProductComplianceAnalysisInput - Input schema for the analysis.
 * - ProductComplianceAnalysisOutput - Output schema for the analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DocumentInputSchema = z.object({
  documentName: z.string().describe("The name of the submitted document file."),
  documentType: z.string().describe("The type of document, e.g., 'Test Report', 'Declaration'."),
  dataUri: z.string().describe("The document content as a data URI."),
});

const RuleInputSchema = z.object({
    certificateName: z.string().describe("The name of the required certificate or document."),
    description: z.string().describe("A description of what the certificate is for."),
});

const ProductComplianceAnalysisInputSchema = z.object({
  productName: z.string().describe("The name of the product being analyzed."),
  rules: z.array(RuleInputSchema).describe("A list of all compliance rules/documents required for this product."),
  documents: z.array(DocumentInputSchema).describe("A list of all documents that have been submitted for this product."),
});
export type ProductComplianceAnalysisInput = z.infer<typeof ProductComplianceAnalysisInputSchema>;

const ProductComplianceAnalysisOutputSchema = z.object({
  overallStatus: z.enum(['Compliant', 'Issues Found', 'Missing Documents']).describe("A high-level summary of the compliance status."),
  overallSummary: z.string().describe("A brief, one or two sentence summary of the findings."),
  documentResults: z.array(z.object({
    ruleName: z.string().describe("The name of the rule this result pertains to."),
    status: z.enum(['Verified', 'Missing', 'Issue Found']).describe("The status for this specific document rule."),
    notes: z.string().describe("A brief explanation of the status, e.g., why an issue was found or which document fulfilled the rule."),
  })).describe("An array of analysis results for each required document rule."),
});
export type ProductComplianceAnalysisOutput = z.infer<typeof ProductComplianceAnalysisOutputSchema>;

export async function analyzeProductCompliance(input: ProductComplianceAnalysisInput): Promise<ProductComplianceAnalysisOutput> {
  return productComplianceAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productComplianceAnalysisPrompt',
  input: { schema: ProductComplianceAnalysisInputSchema },
  output: { schema: ProductComplianceAnalysisOutputSchema },
  prompt: `You are an expert compliance auditor for Digital Product Passports. Your task is to analyze a product's submitted documents against its list of required compliance rules.

Product Name: {{{productName}}}

Required Rules:
{{#each rules}}
- Rule: "{{this.certificateName}}". Description: {{this.description}}
{{/each}}

Submitted Documents:
{{#if documents.length}}
{{#each documents}}
---
Document File Name: {{this.documentName}}
Document Type: {{this.documentType}}
Content:
{{media url=this.dataUri}}
---
{{/each}}
{{else}}
No documents have been submitted.
{{/if}}

Please perform the following analysis:
1.  For each required rule, check if a corresponding document has been submitted.
2.  If a document is submitted for a rule, briefly assess if its content is relevant to the rule. For example, does a "UN 38.3" document look like a transport safety report?
3.  Based on your analysis, provide an overall status and summary.
4.  Provide a detailed breakdown for each rule, stating whether the document is 'Verified' (submitted and seems correct), 'Missing' (no document submitted), or 'Issue Found' (submitted document seems incorrect or irrelevant). Provide brief notes for your reasoning.`,
});

const productComplianceAnalysisFlow = ai.defineFlow(
  {
    name: 'productComplianceAnalysisFlow',
    inputSchema: ProductComplianceAnalysisInputSchema,
    outputSchema: ProductComplianceAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      // Explicitly validate the output from the LLM against the Zod schema.
      const parsedOutput = ProductComplianceAnalysisOutputSchema.safeParse(output);

      if (parsedOutput.success) {
        return parsedOutput.data;
      }
      
      // If validation fails, throw an error to be handled by the catch block.
      throw new Error(`AI output validation failed: ${parsedOutput.error.message}`);

    } catch (error) {
      console.warn("AI compliance analysis flow failed. Returning a structured error response.", error);

      // This logic provides a fallback response when the AI model fails or returns invalid data.
      const allRules = input.rules.map(r => r.certificateName);
      const submittedDocs = input.documents.map(d => d.documentName);

      const documentResults = allRules.map(ruleName => {
        // A more robust system would match rules to docs precisely.
        // For this mock fallback, we'll assume a one-to-one mapping attempt.
        const isSubmitted = submittedDocs.some(docName => docName.toLowerCase().includes(ruleName.toLowerCase().split(' ')[0]));
        
        if (isSubmitted) {
          return {
            ruleName: ruleName,
            status: 'Issue Found' as const,
            notes: 'The submitted document could not be processed by the AI. It might be empty, in an unsupported format, or the AI response was invalid.',
          };
        } else {
          return {
            ruleName: ruleName,
            status: 'Missing' as const,
            notes: 'No document has been submitted for this rule.',
          };
        }
      });
      
      return {
        overallStatus: 'Issues Found' as const,
        overallSummary: 'AI analysis failed. One or more documents could not be processed, or the AI response was invalid. Please check file validity.',
        documentResults,
      };
    }
  }
);
