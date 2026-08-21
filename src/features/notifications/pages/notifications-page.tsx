import { useMemo, useState } from "react";
import { BellOff, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import { NOTIFICATIONS } from "../data";
import type { AppNotification } from "../types";

const CATEGORY_LABELS: Record<AppNotification["category"], string> = {
  "job-order": "Job Order",
  inventory: "Inventory",
  approval: "Approval",
  system: "System",
  mention: "Mention",
};

export function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>(NOTIFICATIONS);
  const [tab, setTab] = useState<"all" | "unread">("all");

  const unreadCount = items.filter((n) => !n.read).length;
  const visible = useMemo(
    () => (tab === "unread" ? items.filter((n) => !n.read) : items),
    [items, tab],
  );

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const toggleRead = (id: number) =>
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notifications"
        description="Stay on top of activity across your workspace."
        actions={
          <Button
            variant="outline"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        }
      />

      <div className="flex items-center justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 ? (
                <Badge variant="brand" className="ml-1.5 px-1.5 py-0">
                  {unreadCount}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="You're all caught up"
          description="There are no notifications to show here."
        />
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {visible.map((n) => {
              const Icon = n.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => toggleRead(n.id)}
                  className={cn(
                    "flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50",
                    !n.read && "bg-primary/[0.03]",
                  )}
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{n.title}</p>
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {CATEGORY_LABELS[n.category]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {n.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.read ? (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  ) : null}
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
