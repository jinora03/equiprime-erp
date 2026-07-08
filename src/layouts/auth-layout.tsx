import { Outlet } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import { APP_NAME, COMPANY_NAME } from "@/constants/app";
import { BrandLogo } from "@/shared/components/brand-logo";

const HIGHLIGHTS = [
  "Role-based access control across 40+ modules",
  "Real-time operations, service, and inventory insight",
  "Built for heavy equipment dealers and service teams",
];

/** Two-pane authentication shell: brand showcase + form outlet. */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden gradient-brand lg:flex">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <BrandLogo size={44} />
            <div className="leading-tight">
              <p className="text-lg font-semibold">{APP_NAME}</p>
              <p className="text-sm text-white/70">{COMPANY_NAME}</p>
            </div>
          </div>

          <div className="max-w-md space-y-6">
            <h2 className="text-3xl font-semibold leading-tight">
              The operating system for your heavy equipment business.
            </h2>
            <ul className="space-y-3">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/90">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
