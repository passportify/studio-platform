import { config } from 'dotenv';
config();

import '@/ai/flows/compliance-check.ts';
import '@/ai/flows/human-in-the-loop-review.ts';
import '@/ai/flows/generate-campaign-email.ts';
import '@/ai/flows/generate-form-template.ts';
import '@/ai/flows/suggest-certificate-rules.ts';
import '@/ai/flows/refine-email-template.ts';
import '@/ai/flows/send-otp.ts';
import '@/ai/flows/product-compliance-analysis.ts';
import '@/ai/flows/traceability-check.ts';
import '@/ai/flows/document-intelligence.ts';
