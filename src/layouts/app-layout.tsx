import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarContent } from "./components/sidebar-content";
import { Topbar } from "./components/topbar";
import { OnboardingRoot } from "@/features/onboarding/onboarding-root";

export function AppLayout() {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } =
    useUIStore();
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);

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
        >
          <SidebarContent inSheet onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 lg:p-6 xl:p-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <OnboardingRoot />
    </div>
  );
}
