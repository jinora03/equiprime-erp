import { Fragment, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

import { NAV_SECTIONS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { titleCase } from "@/utils/string";

/** Path -> human label, built from the nav config plus a few extra routes. */
const LABELS: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.PROFILE]: "My Profile",
  [ROUTES.NOTIFICATIONS]: "Notifications",
  [ROUTES.SETTINGS]: "Settings",
  ...Object.fromEntries(
    NAV_SECTIONS.flatMap((s) => s.items.map((i) => [i.path, i.label])),
  ),
};

export function Breadcrumbs() {
  const { pathname } = useLocation();

  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    let acc = "";
    return segments.map((segment) => {
      acc += `/${segment}`;
      const label =
        LABELS[acc] ?? (/^\d+$/.test(segment) ? "Details" : titleCase(segment));
      return { path: acc, label };
    });
  }, [pathname]);

  const isDashboard = pathname === ROUTES.DASHBOARD;

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden min-w-0 items-center gap-1.5 overflow-hidden text-sm text-muted-foreground md:flex"
    >
      <Link
        to={ROUTES.DASHBOARD}
        className="flex items-center gap-1 transition-colors hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {!isDashboard &&
        crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={crumb.path}>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              {isLast ? (
                <span className="max-w-[240px] truncate font-medium text-foreground xl:max-w-[360px]">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </Fragment>
          );
        })}
    </nav>
  );
}
