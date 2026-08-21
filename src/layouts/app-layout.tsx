import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarContent } from "./components/sidebar-content";
import { Topbar } from "./components/topbar";
import { PrototypeDisclaimer } from "./components/prototype-disclaimer";
import { OnboardingRoot } from "@/features/onboarding/onboarding-root";

const PROTOTYPE_DISCLAIMER_KEY = "equiprime.prototype-disclaimer.v1";

function hasAcknowledgedPrototypeDisclaimer() {
  try {
    return sessionStorage.getItem(PROTOTYPE_DISCLAIMER_KEY) === "acknowledged";
  } catch {
    return false;
  }
}

export function AppLayout() {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } =
    useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const pendingMobilePath = useRef<string | null>(null);
  const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(
    hasAcknowledgedPrototypeDisclaimer,
  );

  const acknowledgePrototypeDisclaimer = () => {
    try {
      sessionStorage.setItem(PROTOTYPE_DISCLAIMER_KEY, "acknowledged");
    } catch {
      // Restricted storage should not prevent the user from entering the demo.
    }
    setDisclaimerAcknowledged(true);
  };

  // Close the mobile drawer whenever navigation happens outside the drawer.
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);

  const handleMobileNavigate = (path: string) => {
    pendingMobilePath.current = path;
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border transition-[width] duration-300 ease-in-out lg:block",
          sidebarCollapsed ? "w-[76px]" : "w-[17rem]",
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[17rem] border-sidebar-border bg-sidebar p-0 sm:w-72 [&>button]:text-sidebar-foreground [&>button:hover]:bg-white/10 [&>button:hover]:text-white"
          onCloseAutoFocus={(event) => {
            const path = pendingMobilePath.current;
            if (!path) return;
            event.preventDefault();
            pendingMobilePath.current = null;
            navigate(path);
          }}
        >
          <SidebarContent inSheet onNavigate={handleMobileNavigate} />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 lg:p-6 xl:p-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <PrototypeDisclaimer
        open={!disclaimerAcknowledged}
        onAcknowledge={acknowledgePrototypeDisclaimer}
      />
      {disclaimerAcknowledged ? <OnboardingRoot /> : null}
    </div>
  );
}
