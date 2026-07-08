import { Link } from "react-router-dom";
import { ArrowLeft, ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldX className="h-8 w-8" />
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-destructive">
        403 — Access denied
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        You don't have access to this module
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your current role doesn't include permission for this page. If you think
        this is a mistake, contact your administrator.
      </p>
      <Button asChild variant="outline" className="mt-8">
        <Link to={ROUTES.DASHBOARD}>
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
