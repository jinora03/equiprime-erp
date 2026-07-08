import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/constants/routes";
import { PageLoader } from "@/components/page-loader";

/**
 * Gate for all authenticated routes. While the session bootstraps we show a
 * loader; unauthenticated users are redirected to login (preserving the target
 * location so they return there after signing in).
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

/** Inverse guard — keeps authenticated users away from the login screen. */
export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <Outlet />;
}
