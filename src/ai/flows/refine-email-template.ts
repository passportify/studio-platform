'use server';
/**
 * @fileOverview An AI flow for refining email template content.
 *
 * - refineEmailTemplate - A function that handles the email refinement process.
 * - RefineEmailTemplateInput - The input type for the refineEmailTemplate function.
 * - RefineEmailTemplateOutput - The return type for the refineEmailTemplate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineEmailTemplateInputSchema = z.object({
  currentBody: z.string().describe('The current markdown content of the email body.'),
  instruction: z.string().describe('The user instruction for how to refine the email. For example: "Make it more formal." or "Add a sense of urgency."'),
});
export type RefineEmailTemplateInput = z.infer<typeof RefineEmailTemplateInputSchema>;

const RefineEmailTemplateOutputSchema = z.object({
  refinedBody: z.string().describe('The refined, well-formatted, professional email body in markdown format.'),
});
export type RefineEmailTemplateOutput = z.infer<typeof RefineEmailTemplateOutputSchema>;

export async function refineEmailTemplate(input: RefineEmailTemplateInput): Promise<RefineEmailTemplateOutput> {
  return refineEmailTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineEmailTemplatePrompt',
  input: {schema: RefineEmailTemplateInputSchema},
  output: {schema: RefineEmailTemplateOutputSchema},
  prompt: `You are an expert in writing professional business communications. Your task is to refine the following email body based on the user's instruction.

It is critical that you keep the Handlebars-style placeholders (e.g., {{user.name}}, {{product.link}}) intact in your response. Do not change them.

Refinement Instruction: {{{instruction}}}

Current Email Body:
---
{{{currentBody}}}
---
`,
});

const refineEmailTemplateFlow = ai.defineFlow(
  {
    name: 'refineEmailTemplateFlow',
    inputSchema: RefineEmailTemplateInputSchema,
    outputSchema: RefineEmailTemplateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
