
'use server';
/**
 * @fileOverview An AI flow to analyze a product's supply chain for risks.
 * 
 * - analyzeTraceability - A function that runs a traceability analysis.
 * - TraceabilityAnalysisInput - Input schema for the analysis.
 * - TraceabilityAnalysisOutput - Output schema for the analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TraceabilityAnalysisInputSchema = z.object({
  productName: z.string().describe("The name of the product being analyzed."),
  billOfMaterialsJson: z.string().describe("The product's bill of materials (supply chain graph) as a JSON string."),
});
export type TraceabilityAnalysisInput = z.infer<typeof TraceabilityAnalysisInputSchema>;

const TraceabilityAnalysisOutputSchema = z.object({
  overallRiskLevel: z.enum(['Low', 'Medium', 'High']).describe("A high-level assessment of the supply chain risk."),
  summary: z.string().describe("A brief, one or two sentence summary of the findings."),
  issues: z.array(z.object({
    riskCategory: z.string().describe("e.g., 'Data Gaps', 'Conflict Minerals', 'Supplier Validity'"),
    description: z.string().describe("A detailed description of the identified issue."),
    recommendation: z.string().describe("A suggestion for how to mitigate this issue."),
  })).describe("A list of specific issues found in the traceability data."),
});
export type TraceabilityAnalysisOutput = z.infer<typeof TraceabilityAnalysisOutputSchema>;

export async function analyzeTraceability(input: TraceabilityAnalysisInput): Promise<TraceabilityAnalysisOutput> {
  return traceabilityAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'traceabilityAnalysisPrompt',
  input: { schema: TraceabilityAnalysisInputSchema },
  output: { schema: TraceabilityAnalysisOutputSchema },
  prompt: `You are an expert supply chain analyst specializing in risk assessment for digital product passports. Your task is to analyze the following Bill of Materials (BOM) for a product and identify potential risks.

Product Name: {{{productName}}}

Bill of Materials (JSON):
\`\`\`json
{{{billOfMaterialsJson}}}
\`\`\`

Analyze the data for the following types of risks:
-   **Data Gaps**: Look for missing suppliers ('supplier_id' is missing or empty), incomplete lower tiers, or materials with a 'Pending' or 'Invited' compliance status which indicates unverified data.
-   **Conflict Minerals**: Identify any materials flagged with 'conflict_minerals_flag: true' that come from high-risk regions (e.g., 'CD' for Congo) without a 'Verified' compliance status.
-   **Supplier Validity**: Note any suppliers that are still in an 'Invited' status, as their data cannot be trusted until they are fully onboarded.

Based on your analysis, provide an overall risk level, a brief summary, and a detailed list of issues with recommendations for how to fix them.`,
});

const traceabilityAnalysisFlow = ai.defineFlow(
  {
    name: 'traceabilityAnalysisFlow',
    inputSchema: TraceabilityAnalysisInputSchema,
    outputSchema: TraceabilityAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
