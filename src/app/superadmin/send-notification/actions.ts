'use server';

import * as z from 'zod';

const sendNotificationSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    link: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
    audience: z.enum(['all', 'suppliers', 'manufacturers', 'verifiers']),
});

type SendNotificationInput = z.infer<typeof sendNotificationSchema>;

export async function sendNotificationAction(
    input: SendNotificationInput
): Promise<{ success: boolean; error?: string }> {
    const validation = sendNotificationSchema.safeParse(input);
    if (!validation.success) {
        return { success: false, error: 'Invalid input.' };
    }

    console.log("Sending notification:", validation.data);

    // In a real application, you would:
    // 1. Identify the users in the target audience.
    // 2. Create a notification record in a database for each user.
    // 3. The client would then fetch these notifications.
    
    // For this prototype, we'll just log the action.
    
    return { success: true };
}
