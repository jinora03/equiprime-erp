import { useEffect, useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import type { OnboardingStep } from "./types";

export interface OnboardingHighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type OnboardingTargetStatus = "idle" | "locating" | "ready" | "missing";

interface UseOnboardingTargetOptions {
  step?: OnboardingStep;
  isMobile: boolean;
  routeReady: boolean;
}

const TARGET_TIMEOUT_MS = 2_500;
const HIGHLIGHT_EDGE = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function isVisibleTarget(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    rect.width > 0 &&
    rect.height > 0
  );
}

function toHighlightRect(
  element: HTMLElement,
  isMobile: boolean,
  maxHeight?: number,
): OnboardingHighlightRect {
  const rect = element.getBoundingClientRect();
  const padding = isMobile ? 8 : 10;
  const left = clamp(rect.left - padding, HIGHLIGHT_EDGE, window.innerWidth - HIGHLIGHT_EDGE);
  const right = clamp(rect.right + padding, HIGHLIGHT_EDGE, window.innerWidth - HIGHLIGHT_EDGE);
  const top = clamp(rect.top - padding, HIGHLIGHT_EDGE, window.innerHeight - HIGHLIGHT_EDGE);
  const bottom = clamp(rect.bottom + padding, HIGHLIGHT_EDGE, window.innerHeight - HIGHLIGHT_EDGE);

  const measuredHeight = Math.max(1, bottom - top);

  return {
    top,
    left,
    width: Math.max(1, right - left),
    height: maxHeight ? Math.min(measuredHeight, maxHeight) : measuredHeight,
  };
}

/**
 * Resolves and measures the current tour target without coupling business UI
 * components to onboarding logic. It tolerates route animation, async content,
 * viewport changes, and targets that are unavailable for a particular layout.
 */
export function useOnboardingTarget({
  step,
  isMobile,
  routeReady,
}: UseOnboardingTargetOptions) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [highlight, setHighlight] = useState<OnboardingHighlightRect | null>(null);
  const [status, setStatus] = useState<OnboardingTargetStatus>("idle");

  useEffect(() => {
    if (!step || !routeReady) {
      setHighlight(null);
      setStatus("idle");
      return;
    }

    const selector = isMobile ? step.mobileTarget ?? step.target : step.target;
    let target: HTMLElement | null = null;
    let frame = 0;
    let settleTimer = 0;
    let missingTimer = 0;
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    const measure = () => {
      if (!target || !document.body.contains(target) || !isVisibleTarget(target)) {
        setHighlight(null);
        setStatus("missing");
        return;
      }
      setHighlight(toHighlightRect(target, isMobile, step.highlightMaxHeight));
      setStatus("ready");
    };

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };

    const attach = (candidate: HTMLElement) => {
      target = candidate;
      mutationObserver?.disconnect();
      window.clearTimeout(missingTimer);

      candidate.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
        inline: "nearest",
      });

      settleTimer = window.setTimeout(
        () => {
          measure();
          if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(scheduleMeasure);
            resizeObserver.observe(candidate);
          }
        },
        prefersReducedMotion ? 0 : 240,
      );
    };

    const locate = () => {
      const candidate = document.querySelector<HTMLElement>(selector);
      if (!candidate || !isVisibleTarget(candidate)) return false;
      attach(candidate);
      return true;
    };

    setHighlight(null);
    setStatus("locating");

    if (!locate()) {
      mutationObserver = new MutationObserver(() => {
        if (locate()) mutationObserver?.disconnect();
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style", "hidden"],
      });

      missingTimer = window.setTimeout(() => {
        if (target) return;
        mutationObserver?.disconnect();
        setHighlight(null);
        setStatus("missing");
      }, TARGET_TIMEOUT_MS);
    }

    const handleViewportChange = () => scheduleMeasure();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    window.visualViewport?.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("scroll", handleViewportChange);

    return () => {
      window.clearTimeout(settleTimer);
      window.clearTimeout(missingTimer);
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("scroll", handleViewportChange);
    };
  }, [isMobile, prefersReducedMotion, routeReady, step]);

  return { highlight, status };
}
