import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Scroll container for content inside a Popover (or other portalled overlay)
 * that may be nested within a Radix Dialog.
 *
 * Radix Dialog uses `react-remove-scroll`, which attaches a document-level,
 * bubble-phase `wheel`/`touchmove` listener that cancels scrolling for anything
 * outside its own subtree. Because Popover content is portalled to `<body>`
 * (outside that subtree), wheel and touch scrolling get blocked — only
 * scrollbar dragging (pointer events) keeps working, which is exactly the
 * "won't scroll with the wheel, only the scrollbar, broken on mobile" symptom.
 *
 * Attaching native (element-level) listeners that stop propagation prevents the
 * event from ever reaching `react-remove-scroll`'s document listener, so native
 * scrolling is restored for the mouse wheel, scrollbar drag, and touch alike.
 * The listeners are passive (we never call `preventDefault`) so the browser
 * still performs the scroll itself.
 */
export const PopoverScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, forwardedRef) => {
  const innerRef = React.useRef<HTMLDivElement | null>(null);

  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  React.useEffect(() => {
    const node = innerRef.current;
    if (!node) return;

    const stop = (event: Event) => event.stopPropagation();
    node.addEventListener("wheel", stop, { passive: true });
    node.addEventListener("touchmove", stop, { passive: true });
    return () => {
      node.removeEventListener("wheel", stop);
      node.removeEventListener("touchmove", stop);
    };
  }, []);

  return (
    <div
      ref={setRef}
      className={cn("overflow-y-auto overscroll-contain", className)}
      {...props}
    />
  );
});
PopoverScrollArea.displayName = "PopoverScrollArea";
