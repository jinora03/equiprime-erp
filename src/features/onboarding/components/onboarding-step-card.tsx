import { forwardRef } from "react";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OnboardingStep } from "../types";

interface OnboardingStepCardProps {
  step: OnboardingStep;
  index: number;
  total: number;
  isMobile: boolean;
  style?: CSSProperties;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingStepCard = forwardRef<HTMLElement, OnboardingStepCardProps>(
  function OnboardingStepCard(
    { step, index, total, isMobile, style, onBack, onNext, onSkip },
    ref,
  ) {
    const Icon = step.icon;
    const isLast = index === total - 1;
    const titleId = `onboarding-title-${step.id}`;
    const descriptionId = `onboarding-description-${step.id}`;

    return (
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(
          "pointer-events-auto z-[92] overflow-y-auto border border-border/80 bg-popover/95 text-popover-foreground shadow-elevated backdrop-blur focus:outline-none",
          isMobile
            ? "fixed inset-x-3 bottom-3 max-h-[calc(100dvh-1.5rem)] rounded-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            : "fixed w-[360px] max-h-[calc(100dvh-2rem)] rounded-xl p-5",
        )}
        style={isMobile ? undefined : style}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {index + 1} of {total}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={onSkip}
              >
                Skip
              </Button>
            </div>
            <h2 id={titleId} className="mt-1 text-base font-semibold">
              {step.title}
            </h2>
            <p
              id={descriptionId}
              className="mt-1.5 text-sm leading-6 text-muted-foreground"
            >
              {step.description}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, dotIndex) => (
            <span
              key={dotIndex}
              className={cn(
                "h-1.5 rounded-full transition-all motion-reduce:transition-none",
                dotIndex === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/25",
              )}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(isMobile && "min-h-10")}
            onClick={onBack}
            disabled={index === 0}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            type="button"
            size="sm"
            className={cn(isMobile && "min-h-10")}
            onClick={onNext}
          >
            {isLast ? (
              <>
                <Check className="h-4 w-4" /> Finish
              </>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </section>
    );
  },
);
