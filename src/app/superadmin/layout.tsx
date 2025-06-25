
'use client';

import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // The public landing page is at the root. It should not have the AppShell.
  if (pathname === '/') {
    return <>{children}</>;
  }

  // The login page is a special case that does not use the portal shell.
  const isLoginPage = pathname === '/superadmin';

  if (isLoginPage) {
    return (
      <div className="min-h-svh w-full flex flex-col items-center justify-center bg-muted p-4">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppShell>{children}</AppShell>
    </SidebarProvider>
  );
}
