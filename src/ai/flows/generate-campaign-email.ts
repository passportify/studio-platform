'use server';
/**
 * @fileOverview An AI flow for generating supplier campaign emails.
 *
 * - generateCampaignEmail - A function that handles the email generation process.
 * - GenerateCampaignEmailInput - The input type for the generateCampaignEmail function.
 * - GenerateCampaignEmailOutput - The return type for the generateCampaignEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCampaignEmailInputSchema = z.object({
  campaignObjective: z.string().describe('The goal of the email campaign. For example: "Request updated REACH certificates for all cobalt suppliers."'),
  companyName: z.string().describe('The name of the company sending the email.'),
});
export type GenerateCampaignEmailInput = z.infer<typeof GenerateCampaignEmailInputSchema>;

const GenerateCampaignEmailOutputSchema = z.object({
  subject: z.string().describe('A concise and professional subject line for the email.'),
  body: z.string().describe('A well-formatted, professional email body. Use markdown for formatting, including line breaks.'),
});
export type GenerateCampaignEmailOutput = z.infer<typeof GenerateCampaignEmailOutputSchema>;

export async function generateCampaignEmail(input: GenerateCampaignEmailInput): Promise<GenerateCampaignEmailOutput> {
  return generateCampaignEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCampaignEmailPrompt',
  input: {schema: GenerateCampaignEmailInputSchema},
  output: {schema: GenerateCampaignEmailOutputSchema},
  prompt: `You are an expert supply chain communication assistant. Your task is to draft a professional and clear email to a supplier based on a campaign objective.

The email should be sent from {{{companyName}}}.

The tone should be professional, courteous, and clear. The email should state the request, explain why it's important, and provide a clear call to action (e.g., "Please log in to the portal to fulfill this request.").

Use markdown for formatting. Ensure there are appropriate line breaks to make the email readable.

Campaign Objective: {{{campaignObjective}}}
`,
});

const generateCampaignEmailFlow = ai.defineFlow(
  {
    name: 'generateCampaignEmailFlow',
    inputSchema: GenerateCampaignEmailInputSchema,
    outputSchema: GenerateCampaignEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
