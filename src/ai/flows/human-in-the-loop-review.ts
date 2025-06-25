'use server';
/**
 * @fileOverview Implements a human-in-the-loop review process for AI-extracted data.
 *
 * - reviewExtractedData - A function that takes AI-extracted data and presents it for human review and validation.
 * - ReviewExtractedDataInput - The input type for the reviewExtractedData function, defining the structure of the AI-extracted data.
 * - ReviewExtractedDataOutput - The output type for the reviewExtractedData function, representing the validated data after human review.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewExtractedDataInputSchema = z.object({
  documentId: z.string().describe("The ID of the document being reviewed."),
  aiExtractedData: z.record(z.any()).describe("The original data extracted by the AI at the time of review."),
  humanCorrectedData: z.record(z.any()).describe("The data after human review and correction."),
  reviewStatus: z.enum(["Approved", "Partially Approved", "Rejected"]).describe("The final status of the review."),
  reviewerId: z.string().describe("The ID of the user who performed the review."),
  notes: z.string().optional().describe("Optional notes from the reviewer explaining the changes or decision."),
});
export type ReviewExtractedDataInput = z.infer<typeof ReviewExtractedDataInputSchema>;

const ReviewExtractedDataOutputSchema = z.object({
  reviewSessionId: z.string().describe("The unique ID for this review session."),
  finalData: z.record(z.any()).describe("The final, validated data."),
  statusMessage: z.string().describe("A message confirming the outcome of the review."),
});
export type ReviewExtractedDataOutput = z.infer<typeof ReviewExtractedDataOutputSchema>;

export async function reviewExtractedData(input: ReviewExtractedDataInput): Promise<ReviewExtractedDataOutput> {
  return reviewExtractedDataFlow(input);
}

const reviewExtractedDataFlow = ai.defineFlow(
  {
    name: 'reviewExtractedDataFlow',
    inputSchema: ReviewExtractedDataInputSchema,
    outputSchema: ReviewExtractedDataOutputSchema,
  },
  async (input) => {
    // In a real application, this flow would write the review session to a database.
    // It would store the original AI output, the human-corrected data, the reviewer's ID,
    // and the timestamp for audit purposes. For this prototype, we'll just log it.
    console.log("Human-in-the-Loop Review Session:");
    console.log(`- Document ID: ${input.documentId}`);
    console.log(`- Reviewer: ${input.reviewerId}`);
    console.log(`- Status: ${input.reviewStatus}`);
    console.log(`- Notes: ${input.notes || 'N/A'}`);
    
    // The final, validated data is the data corrected by the human.
    const finalData = input.humanCorrectedData;

    return {
      reviewSessionId: `review_${Date.now()}`,
      finalData: finalData,
      statusMessage: "Review session logged successfully. Validated data is now the ground truth.",
    };
  }
);
