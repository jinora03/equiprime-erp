import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui.store";
import { Breadcrumbs } from "./breadcrumbs";
import { CompanySwitcher } from "./company-switcher";
import { NotificationsMenu } from "./notifications-menu";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function Topbar() {
  const { sidebarCollapsed, toggleSidebar, setMobileSidebarOpen } =
    useUIStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background px-3 sm:px-4 lg:px-5">
      {/* Mobile: open drawer */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open menu"
        data-onboarding="mobile-menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop: collapse sidebar */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="h-5 w-5" />
        ) : (
          <PanelLeftClose className="h-5 w-5" />
        )}
      </Button>

      <CompanySwitcher className="hidden lg:flex" />

      <div className="mx-1 hidden min-w-0 md:block">
        <Breadcrumbs />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <ThemeToggle />
        <NotificationsMenu />
        <div className="mx-1 h-6 w-px bg-border" />
        <UserMenu />
      </div>
    </header>
  );
}
