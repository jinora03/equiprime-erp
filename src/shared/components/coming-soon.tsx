import { type LucideIcon, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

interface ComingSoonProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  /** Short bullet list of what the module will eventually do. */
  highlights?: string[];
}

/**
 * Reusable placeholder shown for every Phase 2+ module. A single component
 * serves all deferred modules — they differ only by props passed from the route
 * registry. RBAC still protects the route that renders this.
 */
export function ComingSoon({
  title,
  description,
  icon: Icon,
  highlights,
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border bg-card p-10 text-center shadow-card">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand text-primary-foreground shadow-elevated">
            <Icon className="h-7 w-7" />
          </div>

          <Badge variant="brand" className="mb-4">
            <Sparkles className="h-3 w-3" />
            Coming Soon
          </Badge>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {description ??
              `The ${title} module is on the roadmap. The navigation, routing, and access control are already wired up — the full experience arrives in a later phase.`}
          </p>

          {highlights && highlights.length > 0 ? (
            <ul className="mx-auto mt-6 grid max-w-sm gap-2 text-left">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  {item}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild>
              <Link to={ROUTES.DASHBOARD}>
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
