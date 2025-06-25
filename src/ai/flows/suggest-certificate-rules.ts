'use server';
/**
 * @fileOverview An AI flow to suggest certificate requirements based on product details.
 *
 * - suggestCertificateRules - A function that suggests certificate rules.
 * - SuggestCertificateRulesInput - The input type for the suggestCertificateRules function.
 * - SuggestCertificateRulesOutput - The return type for the suggestCertificateRules function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCertificateRulesInputSchema = z.object({
  productDescription: z
    .string()
    .describe(
      'A detailed description of the product, including its type, materials used (e.g., cobalt, plastic), and intended use.'
    ),
  targetRegion: z
    .string()
    .describe('The target market or region, e.g., "EU", "USA".'),
});
export type SuggestCertificateRulesInput = z.infer<
  typeof SuggestCertificateRulesInputSchema
>;

const CertificateSuggestionSchema = z.object({
    certificateName: z.string().describe("The name of the recommended certificate, e.g., 'UN 38.3' or 'REACH Declaration'."),
    description: z.string().describe("A brief explanation of what this certificate is for."),
    regulation: z.string().describe("The primary regulation associated with this certificate, e.g., 'EU Battery Regulation 2023/1542' or 'EC 1907/2006'."),
});
export type CertificateSuggestion = z.infer<typeof CertificateSuggestionSchema>;

const SuggestCertificateRulesOutputSchema = z.object({
  suggestions: z.array(CertificateSuggestionSchema).describe("A list of suggested certificate requirements."),
});
export type SuggestCertificateRulesOutput = z.infer<
  typeof SuggestCertificateRulesOutputSchema
>;

export async function suggestCertificateRules(
  input: SuggestCertificateRulesInput
): Promise<SuggestCertificateRulesOutput> {
  return suggestCertificateRulesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCertificateRulesPrompt',
  input: {schema: SuggestCertificateRulesInputSchema},
  output: {schema: SuggestCertificateRulesOutputSchema},
  prompt: `You are an expert in global product compliance and regulations, with a deep specialization in EU Digital Product Passport (DPP) requirements.

Your task is to analyze the provided product description and target region to suggest the most relevant and mandatory certificates.

Focus on regulations like the EU Battery Regulation, REACH, RoHS, WEEE, and other relevant directives for the specified product type.

Product Description: {{{productDescription}}}
Target Region: {{{targetRegion}}}

Based on this information, provide a list of suggested certificates. For each suggestion, include the certificate name, a brief description of its purpose, and the primary regulation it is tied to.`,
});

const suggestCertificateRulesFlow = ai.defineFlow(
  {
    name: 'suggestCertificateRulesFlow',
    inputSchema: SuggestCertificateRulesInputSchema,
    outputSchema: SuggestCertificateRulesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
