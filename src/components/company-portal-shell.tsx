
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ListOrdered,
  Building,
  History,
  Users,
  Anchor,
  Upload,
  Mail,
  PenSquare,
  Palette,
  Globe,
  HelpCircle,
  Trophy,
  Fingerprint,
  QrCode,
  Handshake,
  CreditCard,
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
  { href: "/company-portal/dashboard", label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/company-portal/my-products", label: "My Products", icon: ListOrdered, exact: false },
  { href: "/company-portal/document-ai", label: "Bulk Processing", icon: Upload, exact: false },
  { href: "/company-portal/campaigns", label: "Campaigns", icon: Mail, exact: false },
  { type: "divider" as const },
  { type: "header" as const, label: "Analytics & Reporting" },
  { href: "/company-portal/supplier-scoreboard", label: "Supplier Scoreboard", icon: Trophy, exact: false },
  { type: "divider" as const },
  { type: "header" as const, label: "Network & Team" },
  { href: "/company-portal/suppliers", label: "Suppliers", icon: Building, exact: false },
  { href: "/company-portal/team", label: "Team", icon: Users, exact: false },
  { type: "divider" as const },
  { type: "header" as const, label: "Settings" },
  { href: "/company-portal/billing", label: "Billing", icon: CreditCard, exact: false },
  { href: "/company-portal/branding", label: "Branding", icon: Palette, exact: false },
  { href: "/company-portal/localization", label: "Localization", icon: Globe, exact: false },
  { href: "/company-portal/privacy", label: "Privacy & Consent", icon: Handshake, exact: false },
  { type: "divider" as const },
  { type: "header" as const, label: "Security & Trust" },
  { href: "/company-portal/audit-trail", label: "Audit Trail", icon: History, exact: false },
  { href: "/company-portal/blockchain-anchors", label: "Blockchain", icon: Anchor, exact: false },
  { href: "/company-portal/digital-signatures", label: "Signatures", icon: PenSquare, exact: false },
  { href: "/company-portal/identity-credentials", label: "Identity", icon: Fingerprint, exact: false },
  { href: "/company-portal/qr-codes", label: "QR Code Engine", icon: QrCode, exact: false },
];

export function CompanyPortalShell({ children }: { children: React.ReactNode }) {
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
            <Link href="/company-portal/dashboard">
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
            {navItems.map((item, index) => {
               if (item.type === 'divider') {
                return <div key={`div-${index}`} className="my-2 border-t border-border" />;
              }
              if (item.type === 'header') {
                return <h2 key={`header-${index}`} className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground tracking-wider uppercase">{item.label}</h2>;
              }
              return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href!)}
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
            )})}
            <div className="my-2 border-t border-border" />
            <h2 className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Support</h2>
            <SidebarMenuItem>
              <SupportDialog>
                <SidebarMenuButton tooltip="Get Support">
                  <LifeBuoy />
                  <span>Support & Tickets</span>
                </SidebarMenuButton>
              </SupportDialog>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton tooltip="How-To Guide" asChild>
                <Link href="/company-portal/how-to">
                    <HelpCircle />
                    <span>How-To Guide</span>
                </Link>
              </SidebarMenuButton>
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
