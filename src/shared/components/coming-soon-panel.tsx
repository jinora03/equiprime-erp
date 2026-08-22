import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonPanelProps {
  title: string;
  description?: string;
}

/**
 * Inline "coming soon" placeholder for sections/panels that are not part of the
 * functional prototype yet (e.g. dashboard category tabs). This is the compact,
 * embed-in-a-page counterpart to the full-page `ComingSoon` route placeholder —
 * both keep the deferred-module treatment consistent and in one place instead of
 * hardcoded per section.
 */
export function ComingSoonPanel({ title, description }: ComingSoonPanelProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-1 px-4 py-16 text-center">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          {description ??
            "Coming soon. This prototype currently focuses on Service operations; other areas will be built out in a later phase."}
        </p>
      </CardContent>
    </Card>
  );
}
