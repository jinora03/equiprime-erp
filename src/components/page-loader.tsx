import { BrandLogo } from "@/shared/components/brand-logo";

/** Full-screen branded loading state used during auth bootstrap / lazy loads. */
export function PageLoader() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <div className="animate-pulse">
        <BrandLogo size={48} />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
      </div>
    </div>
  );
}
