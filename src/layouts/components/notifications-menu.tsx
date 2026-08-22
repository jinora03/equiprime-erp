import { Bell, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES } from "@/constants/routes";
import { useMyApprovals } from "@/features/approvals/hooks";
import { NOTIFICATIONS } from "@/features/notifications/data";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";

export function NotificationsMenu() {
  const { can } = usePermissions();
  const { data: approvalTasks = [] } = useMyApprovals();
  const approvalNotifications = approvalTasks
    .filter((task) => task.status === "pending")
    .map((task) => ({
      id: `approval:${task.id}`,
      title: `${task.recordCode} needs your approval`,
      description: `${task.transitionLabel}: ${task.fromStageName} → ${task.toStageName}`,
      icon: ClipboardCheck,
      createdAt: task.requestedAt,
      read: false,
      href: ROUTES.APPROVALS,
    }));
  const notifications = [...approvalNotifications, ...NOTIFICATIONS];
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  // "View all" belongs to the notifications center. Only fall back to My
  // Approvals for roles that cannot reach the center but still act on approvals
  // (individual approval items already deep-link to My Approvals on their own).
  const viewAllHref = can("notifications:view")
    ? ROUTES.NOTIFICATIONS
    : can("approvals:view")
      ? ROUTES.APPROVALS
      : null;
  const viewAllLabel = viewAllHref === ROUTES.NOTIFICATIONS
    ? "Open notifications center"
    : "Open My Approvals";

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
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[calc(100vw-1.5rem)] max-w-[380px] p-0"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                {unreadCount} new
              </span>
            ) : null}
          </div>
          {viewAllHref ? (
            <Link
              to={viewAllHref}
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>
        <ScrollArea className="h-[360px]">
          <div className="divide-y">
            {notifications.slice(0, 5).map((notification) => {
              const Icon = notification.icon;
              const content = (
                <>
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug text-foreground">
                      {notification.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {notification.description}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read ? (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  ) : null}
                </>
              );
              const className = cn(
                "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                !notification.read && "bg-brand/[0.03]",
              );

              return "href" in notification ? (
                <Link key={notification.id} to={notification.href} className={className}>
                  {content}
                </Link>
              ) : (
                <div key={notification.id} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        {viewAllHref ? (
          <div className="border-t p-2">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link to={viewAllHref}>{viewAllLabel}</Link>
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
