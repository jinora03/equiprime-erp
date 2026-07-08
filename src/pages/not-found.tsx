import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export function NotFoundPage() {
  return (
    <div className="bg-grid flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <SearchX className="h-8 w-8" />
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand">
        404 — Not found
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        This page took a wrong turn
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page you're looking for doesn't exist or may have been moved. Check
        the URL or head back to your dashboard.
      </p>
      <Button asChild className="mt-8">
        <Link to={ROUTES.DASHBOARD}>
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
