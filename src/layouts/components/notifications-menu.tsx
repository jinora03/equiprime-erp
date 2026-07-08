import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES } from "@/constants/routes";
import { NOTIFICATIONS, UNREAD_COUNT } from "@/features/notifications/data";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";

export function NotificationsMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-[1.15rem] w-[1.15rem]" />
          {UNREAD_COUNT > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {UNREAD_COUNT > 0 ? (
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                {UNREAD_COUNT} new
              </span>
            ) : null}
          </div>
          <Link
            to={ROUTES.NOTIFICATIONS}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <ScrollArea className="h-[360px]">
          <div className="divide-y">
            {NOTIFICATIONS.slice(0, 5).map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                    !n.read && "bg-primary/[0.03]",
                  )}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug text-foreground">
                      {n.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {n.description}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.read ? (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="border-t p-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to={ROUTES.NOTIFICATIONS}>Open notifications center</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
