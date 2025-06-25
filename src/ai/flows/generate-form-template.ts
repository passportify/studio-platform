'use server';
/**
 * @fileOverview An AI flow for generating product passport form templates.
 *
 * - generateFormTemplate - A function that handles the schema generation process.
 * - GenerateFormTemplateInput - The input type for the generateFormTemplate function.
 * - GenerateFormTemplateOutput - The return type for the generateFormTemplate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFormTemplateInputSchema = z.object({
  industryName: z.string().describe('The name of the industry, e.g., "Battery".'),
  categoryName: z.string().describe('The name of the product category, e.g., "EV Battery".'),
});
export type GenerateFormTemplateInput = z.infer<typeof GenerateFormTemplateInputSchema>;

const FormTemplateFieldSchema = z.object({
  field_id: z.string().describe("A unique, programmatic ID for the field in snake_case, e.g., 'product_weight_kg'."),
  label: z.string().describe("A human-readable label for the form field, e.g., 'Product Weight (kg)'."),
  type: z.enum(['text', 'float', 'select', 'boolean', 'textarea', 'date']).describe("The data type of the field."),
  required: z.boolean().describe("Whether the field is mandatory."),
  placeholder: z.string().optional().describe("Example text to show in the input field, e.g., 'Enter the weight in kilograms'."),
  options: z.array(z.string()).optional().describe("An array of string options, only for 'select' type fields."),
});

const GenerateFormTemplateOutputSchema = z.object({
  fields_schema: z.array(FormTemplateFieldSchema).describe("An exhaustive array of fields for the product passport schema."),
});
export type GenerateFormTemplateOutput = z.infer<typeof GenerateFormTemplateOutputSchema>;


export async function generateFormTemplate(input: GenerateFormTemplateInput): Promise<GenerateFormTemplateOutput> {
  return generateFormTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFormTemplatePrompt',
  input: {schema: GenerateFormTemplateInputSchema},
  output: {schema: GenerateFormTemplateOutputSchema},
  prompt: `You are an expert in regulatory compliance and data modeling for Digital Product Passports (DPP).
Your task is to generate an exhaustive and accurate list of metadata fields required for a DPP for the given product.

Industry: {{{industryName}}}
Product Category: {{{categoryName}}}

Based on this, create a comprehensive schema. Include fields for identification, manufacturer details, technical specifications, materials, circularity (recycling, repair), and compliance.
For each field, provide a unique snake_case 'field_id', a human-readable 'label', a 'type' (from text, float, select, boolean, textarea, date), whether it is 'required', and an optional 'placeholder'.
For 'select' fields, provide a list of 'options'. The field_id should be concise and programmatic.

The output must be a JSON object with a single key "fields_schema" containing an array of these field objects.`,
});

const generateFormTemplateFlow = ai.defineFlow(
  {
    name: 'generateFormTemplateFlow',
    inputSchema: GenerateFormTemplateInputSchema,
    outputSchema: GenerateFormTemplateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
