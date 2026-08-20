import { Navigate, Route, Routes } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { NAV_SECTIONS } from "@/constants/navigation";
import { AppLayout } from "@/layouts/app-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { ProtectedRoute, PublicOnlyRoute } from "@/routes/protected-route";
import { RequirePermission } from "@/routes/require-permission";
import { ComingSoon } from "@/shared/components/coming-soon";

import { LoginPage } from "@/features/auth/pages/login-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { ApprovalsPage } from "@/features/approvals/pages/approvals-page";
import { UsersPage } from "@/features/users/pages/users-page";
import { UserDetailPage } from "@/features/users/pages/user-detail-page";
import { DepartmentsPage } from "@/features/departments/pages/departments-page";
import { RolesPage } from "@/features/roles/pages/roles-page";
import { PermissionMatrixPage } from "@/features/permissions/pages/permission-matrix-page";
import { ProfilePage } from "@/features/profile/pages/profile-page";
import { NotificationsPage } from "@/features/notifications/pages/notifications-page";
import { SettingsPage } from "@/features/settings/pages/settings-page";
import { WorkflowsPage } from "@/features/workflows/pages/workflows-page";
import { WorkflowEditorPage } from "@/features/workflows/pages/workflow-editor-page";
import { JobOrdersPage } from "@/features/job-orders/pages/job-orders-page";
import { JobOrderDetailPage } from "@/features/job-orders/pages/job-order-detail-page";
import { ProjectsPage } from "@/features/projects/pages/projects-page";
import { MaintenancePage } from "@/features/maintenance/pages/maintenance-page";
import { InventoryPage } from "@/features/inventory/pages/inventory-page";
import { CustomersPage } from "@/features/customers/pages/customers-page";
import { EquipmentPage } from "@/features/equipment/pages/equipment-page";
import { NotFoundPage } from "@/pages/not-found";

/** Deferred modules: derived from the nav config so there's a single source. */
const deferredItems = NAV_SECTIONS.flatMap((section) =>
  section.items.filter((item) => item.comingSoon),
);

export function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>
      </Route>

      {/* Authenticated app shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path={ROUTES.ROOT}
            element={<Navigate to={ROUTES.DASHBOARD} replace />}
          />

          {/* Phase 1 — real pages */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <RequirePermission permission="dashboard:view">
                <DashboardPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.APPROVALS}
            element={
              <RequirePermission permission="approvals:view">
                <ApprovalsPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.USERS}
            element={
              <RequirePermission permission="users:view">
                <UsersPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.USER_DETAIL}
            element={
              <RequirePermission permission="users:view">
                <UserDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.DEPARTMENTS}
            element={
              <RequirePermission permission="departments:view">
                <DepartmentsPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.ROLES}
            element={
              <RequirePermission permission="roles:view">
                <RolesPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.PERMISSIONS}
            element={
              <RequirePermission permission="permissions:view">
                <PermissionMatrixPage />
              </RequirePermission>
            }
          />
          {/* Profile is always accessible to the signed-in user */}
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route
            path={ROUTES.NOTIFICATIONS}
            element={
              <RequirePermission permission="notifications:view">
                <NotificationsPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              <RequirePermission permission="settings:view">
                <SettingsPage />
              </RequirePermission>
            }
          />

          {/* Phase 1.1 — Workflow admin + workflow-enabled Service modules */}
          <Route
            path={ROUTES.WORKFLOWS}
            element={
              <RequirePermission permission="workflows:view">
                <WorkflowsPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.WORKFLOW_EDITOR}
            element={
              <RequirePermission permission="workflows:view">
                <WorkflowEditorPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.JOB_ORDERS}
            element={
              <RequirePermission permission="job-orders:view">
                <JobOrdersPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.JOB_ORDER_DETAIL}
            element={
              <RequirePermission permission="job-orders:view">
                <JobOrderDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.PROJECTS}
            element={
              <RequirePermission permission="projects:view">
                <ProjectsPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.MAINTENANCE}
            element={
              <RequirePermission permission="maintenance:view">
                <MaintenancePage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.INVENTORY}
            element={
              <RequirePermission permission="inventory:view">
                <InventoryPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.CUSTOMERS}
            element={
              <RequirePermission permission="customers:view">
                <CustomersPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.EQUIPMENT}
            element={
              <RequirePermission permission="equipment:view">
                <EquipmentPage />
              </RequirePermission>
            }
          />

          {/* Deferred modules — Coming Soon placeholders, still RBAC-protected */}
          {deferredItems.map((item) => (
            <Route
              key={item.id}
              path={item.path}
              element={
                <RequirePermission permission={item.permission}>
                  <ComingSoon title={item.label} icon={item.icon} />
                </RequirePermission>
              }
            />
          ))}
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
}
