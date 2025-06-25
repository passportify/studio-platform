
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  List,
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
import { Avatar, AvatarFallback } from "./ui/avatar";

const navItems = [
  { href: "/verifier-portal/dashboard", label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/verifier-portal/queue", label: "Verification Queue", icon: List, exact: false },
  { href: "/verifier-portal/how-to", label: "How-To Guide", icon: HelpCircle, exact: false },
];

export function VerifierPortalShell({ children }: { children: React.ReactNode }) {
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
            <Link href="/verifier-portal/dashboard">
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
          <div className="p-2">
            <Link href="#">
              <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>N</AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:hidden">
                    <p className="font-semibold">Nina Verifier</p>
                    <p className="text-xs text-muted-foreground">SGS Global Services</p>
                </div>
              </div>
            </Link>
          </div>
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
