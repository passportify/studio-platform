import { SendNotificationClient } from '@/components/send-notification-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Send Notification',
};

export default function SendNotificationPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Send Platform Notification
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Compose and send a notification that will appear in the "bell" icon popover for a targeted group of users.
      </p>
      <SendNotificationClient />
    </main>
  );
}
