// src/ai/flows/compliance-check.ts
'use server';
/**
 * @fileOverview A compliance check AI agent.
 *
 * - complianceCheck - A function that handles the compliance check process.
 * - ComplianceCheckInput - The input type for the complianceCheck function.
 * - ComplianceCheckOutput - The return type for the complianceCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComplianceCheckInputSchema = z.object({
  productData: z.string().describe('The product data to validate against regulatory requirements.'),
  industry: z.string().describe('The industry of the product.'),
  regulatoryRequirements: z.string().describe('The regulatory requirements to check against.'),
});
export type ComplianceCheckInput = z.infer<typeof ComplianceCheckInputSchema>;

const ComplianceCheckOutputSchema = z.object({
  complianceIssues: z.array(z.string()).describe('The list of compliance issues found in the product data.'),
  summary: z.string().describe('A summary of the compliance check results.'),
});
export type ComplianceCheckOutput = z.infer<typeof ComplianceCheckOutputSchema>;

export async function complianceCheck(input: ComplianceCheckInput): Promise<ComplianceCheckOutput> {
  return complianceCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'complianceCheckPrompt',
  input: {schema: ComplianceCheckInputSchema},
  output: {schema: ComplianceCheckOutputSchema},
  prompt: `You are an expert in regulatory compliance.

You will use the product data, industry, and regulatory requirements to identify any potential compliance issues.

Product Data: {{{productData}}}
Industry: {{{industry}}}
Regulatory Requirements: {{{regulatoryRequirements}}}

Compliance Issues:`, // The LLM will generate compliance issues based on this prompt
});

const complianceCheckFlow = ai.defineFlow(
  {
    name: 'complianceCheckFlow',
    inputSchema: ComplianceCheckInputSchema,
    outputSchema: ComplianceCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
