import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

import { useIsMobile } from "@/hooks/use-media-query";
import type { OnboardingStep } from "../types";
import { useOnboardingTarget } from "../use-onboarding-target";
import { OnboardingStepCard } from "./onboarding-step-card";

interface OnboardingTourProps {
  steps: OnboardingStep[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onComplete: () => void;
  onSkip: () => void;
}

const EDGE = 16;
const GAP = 14;
const CARD_WIDTH = 360;
const CARD_HEIGHT_FALLBACK = 260;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export function OnboardingTour({
  steps,
  currentIndex,
  onIndexChange,
  onComplete,
  onSkip,
}: OnboardingTourProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT_FALLBACK);

  const step = steps[currentIndex];
  const routeReady = !step?.route || location.pathname === step.route;
  const { highlight, status } = useOnboardingTarget({ step, isMobile, routeReady });

  const next = useCallback(() => {
    if (currentIndex >= steps.length - 1) {
      onComplete();
      return;
    }
    onIndexChange(currentIndex + 1);
  }, [currentIndex, onComplete, onIndexChange, steps.length]);

  const back = useCallback(() => {
    onIndexChange(Math.max(0, currentIndex - 1));
  }, [currentIndex, onIndexChange]);

  useEffect(() => {
    if (!step) return;
    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
    }
  }, [location.pathname, navigate, step]);

  // A missing/hidden target should never strand the user behind a dim overlay.
  // Permission filtering happens before the tour starts; this is only a layout
  // resilience fallback for targets that are unavailable in the current view.
  useEffect(() => {
    if (status !== "missing") return;
    const timer = window.setTimeout(next, 180);
    return () => window.clearTimeout(timer);
  }, [next, status]);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    return () => restoreFocusRef.current?.focus?.();
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    card.focus({ preventScroll: true });

    const measure = () => setCardHeight(card.getBoundingClientRect().height || CARD_HEIGHT_FALLBACK);
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, [currentIndex, isMobile]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onSkip();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft" && currentIndex > 0) {
        event.preventDefault();
        back();
      } else if (event.key === "Tab" && cardRef.current) {
        const focusable = Array.from(
          cardRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) {
          event.preventDefault();
          cardRef.current.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [back, currentIndex, next, onSkip]);

  const cardStyle = useMemo<CSSProperties | undefined>(() => {
    if (isMobile || typeof window === "undefined") return undefined;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const safeCardHeight = Math.min(cardHeight, viewportHeight - EDGE * 2);

    if (!highlight) {
      return {
        left: clamp((viewportWidth - CARD_WIDTH) / 2, EDGE, viewportWidth - CARD_WIDTH - EDGE),
        top: clamp(
          (viewportHeight - safeCardHeight) / 2,
          EDGE,
          viewportHeight - safeCardHeight - EDGE,
        ),
      };
    }

    if (highlight.left + highlight.width + GAP + CARD_WIDTH <= viewportWidth - EDGE) {
      return {
        left: highlight.left + highlight.width + GAP,
        top: clamp(highlight.top, EDGE, viewportHeight - safeCardHeight - EDGE),
      };
    }

    if (highlight.left - GAP - CARD_WIDTH >= EDGE) {
      return {
        left: highlight.left - GAP - CARD_WIDTH,
        top: clamp(highlight.top, EDGE, viewportHeight - safeCardHeight - EDGE),
      };
    }

    const belowTop = highlight.top + highlight.height + GAP;
    if (belowTop + safeCardHeight <= viewportHeight - EDGE) {
      return {
        left: clamp(highlight.left, EDGE, viewportWidth - CARD_WIDTH - EDGE),
        top: belowTop,
      };
    }

    return {
      left: clamp(highlight.left, EDGE, viewportWidth - CARD_WIDTH - EDGE),
      top: Math.max(EDGE, highlight.top - safeCardHeight - GAP),
    };
  }, [cardHeight, highlight, isMobile]);

  if (!step || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] pointer-events-auto overscroll-contain"
      aria-live="polite"
    >
      {highlight ? (
        <div
          className="fixed z-[91] rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background transition-[top,left,width,height] duration-200 motion-reduce:transition-none"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
            boxShadow: "0 0 0 9999px rgb(2 6 23 / 0.58)",
          }}
          aria-hidden
        />
      ) : (
        <div className="fixed inset-0 bg-slate-950/55 dark:bg-black/65" aria-hidden />
      )}

      <OnboardingStepCard
        ref={cardRef}
        step={step}
        index={currentIndex}
        total={steps.length}
        isMobile={isMobile}
        style={cardStyle}
        onBack={back}
        onNext={next}
        onSkip={onSkip}
      />
    </div>,
    document.body,
  );
}
