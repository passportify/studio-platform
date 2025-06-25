'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { VerifierPortalShell } from '@/components/verifier-portal-shell';
import Image from 'next/image';

export default function VerifierPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/verifier-portal';

  if (isLoginPage) {
    return (
       <div className="min-h-svh w-full flex flex-col items-center justify-center bg-muted p-4">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
        <VerifierPortalShell>{children}</VerifierPortalShell>
    </SidebarProvider>
  );
}
