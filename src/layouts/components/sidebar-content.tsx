import { Link, NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";
import { APP_NAME, APP_VERSION } from "@/constants/app";
import { ROUTES } from "@/constants/routes";
import { NAV_SECTIONS } from "@/constants/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { BrandLogo } from "@/shared/components/brand-logo";
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
      <div className="relative flex h-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
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

        {/* Nav */}
        <nav className="relative z-10 flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.id} className="space-y-1">
              {!collapsed ? (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
                  {section.label}
                </p>
              ) : (
                <div className="mx-2 mb-1 border-t border-sidebar-border/60" />
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
        className="group mx-auto block h-10 w-10 rounded-lg"
      >
        {({ isActive }) => (
          <span
            className={cn(
              "flex h-full w-full items-center justify-center rounded-lg transition-colors",
              isActive
                ? "bg-sidebar-accent text-slate-900 shadow-sm"
                : "text-sidebar-foreground hover:bg-white/10 hover:text-white",
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
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.comingSoon ? (
            <span className="text-[10px] text-slate-400">Soon</span>
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
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent font-semibold text-slate-900 shadow-sm"
            : "text-sidebar-foreground/90 hover:bg-white/10 hover:text-white",
        )
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0 text-current" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.comingSoon ? (
        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-sidebar-muted">
          Under Construction
        </span>
      ) : item.badge ? (
        <span className="rounded-full bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-semibold text-slate-900">
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  );
}
