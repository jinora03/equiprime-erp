import { Link, NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";
import { APP_NAME, APP_VERSION } from "@/constants/app";
import { ROUTES } from "@/constants/routes";
import { NAV_SECTIONS } from "@/constants/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { BrandLogo } from "@/shared/components/brand-logo";
import { CompanySwitcher } from "./company-switcher";
import equiprimeLogo from "@/assets/equiprime-logo.jpg";
import heavyEquipment from "@/assets/heavy-equipment.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NavItem } from "@/types";

interface SidebarContentProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  /** True when rendered inside the mobile drawer (reserves room for its close button). */
  inSheet?: boolean;
}

export function SidebarContent({
  collapsed = false,
  onNavigate,
  inSheet = false,
}: SidebarContentProps) {
  const { can } = usePermissions();

  // Keep only sections that have at least one permitted item.
  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => can(item.permission)),
  })).filter((section) => section.items.length > 0);

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className="relative flex h-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground"
      >
        {/* Subtle heavy-equipment backdrop */}
        <img
          src={heavyEquipment}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-1 left-1/2 w-[135%] max-w-none -translate-x-1/2 select-none opacity-[0.07] grayscale brightness-200 [mask-image:linear-gradient(to_top,black_25%,transparent)]"
        />

        {/* Brand */}
        <div
          className={cn(
            "relative z-10 border-b border-sidebar-border",
            collapsed ? "flex h-16 items-center justify-center" : "px-4 py-3.5",
            !collapsed && inSheet && "pr-14",
          )}
        >
          <Link
            to={ROUTES.DASHBOARD}
            className={cn("block", collapsed && "flex items-center justify-center")}
            onClick={onNavigate}
            aria-label={APP_NAME}
          >
            {collapsed ? (
              <BrandLogo size={34} />
            ) : (
              <img
                src={equiprimeLogo}
                alt={APP_NAME}
                className="block w-full select-none rounded-lg"
              />
            )}
          </Link>
        </div>

        {inSheet ? (
          <div className="relative z-10 border-b border-sidebar-border px-3 py-3 lg:hidden">
            <CompanySwitcher className="flex w-full max-w-none border-sidebar-border bg-white/[0.04] text-sidebar-foreground hover:bg-white/[0.08] hover:text-white" />
          </div>
        ) : null}

        {/* Nav */}
        <nav
          className="relative z-10 flex-1 space-y-4 overflow-y-auto px-2.5 py-4"
          data-onboarding="sidebar-navigation"
        >
          {sections.map((section) => (
            <div key={section.id} className="space-y-1">
              {!collapsed ? (
                <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-muted">
                  {section.label}
                </p>
              ) : (
                <div className="mx-2.5 mb-1 border-t border-sidebar-border/60" />
              )}
              {section.items.map((item) => (
                <SidebarLink
                  key={item.id}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "relative z-10 border-t border-sidebar-border px-4 py-3",
            collapsed && "text-center",
          )}
        >
          {collapsed ? (
            <p className="text-[10px] text-sidebar-muted">v{APP_VERSION}</p>
          ) : (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/80">
                Equiprime ERP System
              </p>
              <p className="text-[10px] text-sidebar-muted">
                Version {APP_VERSION}
              </p>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function SidebarLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  if (collapsed) {
    /*
     * TooltipTrigger uses Radix Slot when `asChild` is enabled. Keep the
     * NavLink className static here and put active-state styling inside the
     * NavLink render prop so Slot never has to merge a function-valued
     * className. This also keeps the icon color and selected state reliable.
     */
    const collapsedLink = (
      <NavLink
        to={item.path}
        onClick={onNavigate}
        className="group mx-auto block h-10 w-10 rounded-md"
      >
        {({ isActive }) => (
          <span
            className={cn(
              "flex h-full w-full items-center justify-center rounded-md transition-colors",
              isActive
                ? "bg-sidebar-accent/[0.16] text-sidebar-accent"
                : "text-sidebar-foreground/90 hover:bg-white/[0.07] hover:text-white",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
          </span>
        )}
      </NavLink>
    );

    return (
      <Tooltip>
        <TooltipTrigger asChild>{collapsedLink}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="flex items-center gap-2">
          {item.label}
          {item.comingSoon ? (
            <span className="text-[10px] text-muted-foreground">Coming soon</span>
          ) : null}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent/[0.14] font-semibold text-sidebar-accent"
            : "text-sidebar-foreground/90 hover:bg-white/[0.07] hover:text-white",
        )
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0 text-current" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.comingSoon ? (
        <span
          className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.08em] text-sidebar-muted/75"
          title="Coming soon"
        >
          Soon
        </span>
      ) : item.badge ? (
        <span className="rounded-full bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-semibold text-slate-950">
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  );
}
