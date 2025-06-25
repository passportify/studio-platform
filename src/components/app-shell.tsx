
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Factory,
  Shapes,
  ClipboardList,
  BadgeCheck,
  History,
  QrCode,
  Building2,
  Network,
  Anchor,
  Signature,
  Languages,
  Fingerprint,
  Blocks,
  CreditCard,
  Trophy,
  Info,
  Package,
  Box,
  FileCheck2,
  LifeBuoy,
  Send,
  Mail,
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
  { href: "/superadmin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { type: "divider" },
  { type: "header", label: "Platform" },
  { href: "/superadmin/features-overview", label: "Features Overview", icon: Info },
  { type: "divider" },
  { type: "header", label: "Global Registries" },
  { href: "/superadmin/products", label: "Products", icon: Package },
  { href: "/superadmin/materials", label: "Materials", icon: Box },
  { href: "/superadmin/certificates", label: "Certificates", icon: FileCheck2 },
  { type: "divider" },
  { type: "header", label: "Analytics & Monitoring" },
  { href: "/superadmin/audit-trail", label: "Event & Change Logs", icon: History },
  { href: "/superadmin/supplier-scoreboard", label: "Supplier Scoreboard", icon: Trophy },
  { type: "divider" },
  { type: "header", label: "Configuration" },
  { href: "/superadmin/entity-registry", label: "Entity Registry", icon: Building2 },
  { href: "/superadmin/industries", label: "Industries", icon: Factory },
  { href: "/superadmin/product-categories", label: "Categories", icon: Shapes },
  { href: "/superadmin/form-templates", label: "Schemas & Templates", icon: ClipboardList },
  { href: "/superadmin/certificate-rules", label: "Certificate Rules", icon: BadgeCheck },
  { href: "/superadmin/country-packs", label: "Country Packs", icon: Languages },
  { href: "/superadmin/module-access", label: "Module Access", icon: Blocks },
  { href: "/superadmin/plans", label: "Plans & Subscriptions", icon: CreditCard },
  { type: "divider" },
  { type: "header", label: "Communication" },
  { href: "/superadmin/send-notification", label: "Send Notification", icon: Send },
  { href: "/superadmin/email-engine", label: "Email Engine", icon: Mail },
  { type: "divider" },
  { type: "header", label: "Trust & Identity" },
  { href: "/superadmin/traceability", label: "Traceability Engine", icon: Network },
  { href: "/superadmin/qr-code-engine", label: "QR Code Engine", icon: QrCode },
  { href: "/superadmin/blockchain-anchors", label: "Blockchain Anchors", icon: Anchor },
  { href: "/superadmin/digital-signatures", label: "Digital Signatures", icon: Signature },
  { href: "/superadmin/identity-credentials", label: "Identity & Credentials", icon: Fingerprint },
  { type: "divider" },
  { type: "header", label: "Support" },
  { href: "/superadmin/support-tickets", label: "Support Tickets", icon: LifeBuoy },
];

export function AppShell({ children }: { children: React.ReactNode }) {
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
            <Link href="/superadmin/dashboard">
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
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  onClick={handleLinkClick}
                  asChild
                >
                  <Link href={item.href!}>
                    {(() => {
                      const Icon = item.icon;
                      return Icon ? <Icon /> : null;
                    })()}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )})}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* The SupportDialog was removed from here to declutter the admin UI. */}
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
