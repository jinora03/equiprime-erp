import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TABS_LIST_CLASSNAME =
  "inline-flex h-9 items-center justify-center rounded-md border bg-muted/60 p-0.5 text-muted-foreground";

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(TABS_LIST_CLASSNAME, className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const ScrollableTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateOverflow = React.useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const remaining =
      scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft;
    setCanScrollRight(remaining > 4);
  }, []);

  React.useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    updateOverflow();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateOverflow);
    resizeObserver?.observe(scroller);
    if (scroller.firstElementChild instanceof HTMLElement) {
      resizeObserver?.observe(scroller.firstElementChild);
    }

    window.addEventListener("resize", updateOverflow);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [updateOverflow]);

  return (
    <div className="relative min-w-0">
      <div
        ref={scrollerRef}
        className="overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:thin]"
        onScroll={updateOverflow}
      >
        <TabsPrimitive.List
          ref={ref}
          className={cn(
            TABS_LIST_CLASSNAME,
            "h-auto w-max min-w-full flex-nowrap justify-start gap-1 whitespace-nowrap",
            className,
          )}
          {...props}
        >
          {children}
        </TabsPrimitive.List>
      </div>
      {canScrollRight ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full border bg-background/95 text-muted-foreground shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      ) : null}
    </div>
  );
});
ScrollableTabsList.displayName = "ScrollableTabsList";

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, ScrollableTabsList, TabsTrigger, TabsContent };
