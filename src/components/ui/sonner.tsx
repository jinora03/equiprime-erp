import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useTheme } from "@/contexts/theme-context";

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast !border-border !bg-popover !pr-10 !text-popover-foreground !shadow-elevated ring-1 ring-border/60",
          description: "!text-muted-foreground",
          closeButton:
            "!left-auto !right-2 !top-2 !h-6 !w-6 !translate-x-0 !translate-y-0 !border-border !bg-background !text-muted-foreground hover:!bg-muted hover:!text-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
