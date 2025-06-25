'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SupplierPortalShell } from '@/components/supplier-portal-shell';
import Image from 'next/image';

export default function SupplierPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // The login page is a special case that does not use the portal shell.
  const isLoginPage = pathname === '/supplier-portal';

  if (isLoginPage) {
    return (
       <div className="min-h-svh w-full flex flex-col items-center justify-center bg-muted p-4">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
        <SupplierPortalShell>{children}</SupplierPortalShell>
    </SidebarProvider>
  );
}
