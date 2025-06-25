
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Library,
  ListOrdered,
  HelpCircle,
  LifeBuoy,
} from "lucide-react";

import {
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NotificationsPopover } from "./notifications-popover";
import { SupportDialog } from "./support-widget";

const navItems = [
  { href: "/supplier-portal/dashboard", label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/supplier-portal/my-materials", label: "My Materials", icon: Library, exact: false },
  { href: "/supplier-portal/my-products", label: "Associated Products", icon: ListOrdered, exact: false },
  { href: "/supplier-portal/how-to", label: "How-To Guide", icon: HelpCircle, exact: false },
];

export function SupplierPortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="p-2 flex h-14 items-center justify-center">
            <Link href="/supplier-portal/dashboard">
              <Image 
                src="/passportify-logo.png" 
                alt="Passportify Logo" 
                width={140} 
                height={32} 
                className="h-8 w-auto transition-all group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 object-contain"
              />
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
                  tooltip={item.label}
                  onClick={handleLinkClick}
                  asChild
                >
                  <Link href={item.href!}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
             <div className="my-2 border-t border-border" />
             <SidebarMenuItem>
              <SupportDialog>
                <SidebarMenuButton tooltip="Get Support">
                  <LifeBuoy />
                  <span>Support</span>
                </SidebarMenuButton>
              </SupportDialog>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content can go here */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center gap-2">
                <NotificationsPopover />
                <Button variant="outline">Sign Out</Button>
            </div>
        </header>
        {children}
      </SidebarInset>
    </>
  );
}
