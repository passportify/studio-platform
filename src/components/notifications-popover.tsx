
"use client";

import { Bell, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { mockNotifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "./ui/badge";

export function NotificationsPopover() {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0">{unreadCount}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 font-semibold border-b">
          Notifications
        </div>
        <div className="p-2 max-h-96 overflow-y-auto">
          {mockNotifications.length > 0 ? (
            mockNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.link}
                className={cn(
                  "block p-2 rounded-md transition-colors hover:bg-accent",
                  !notification.read && "bg-blue-50"
                )}
              >
                <p className="font-semibold text-sm">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
              </Link>
            ))
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">No new notifications.</p>
          )}
        </div>
        <div className="p-2 border-t text-center">
            <Button variant="ghost" size="sm" className="w-full">
                <Check className="mr-2 h-4 w-4"/>
                Mark all as read
            </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
