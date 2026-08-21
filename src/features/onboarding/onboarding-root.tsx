import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-media-query";
import { usePermissions } from "@/hooks/use-permissions";
import { OnboardingTour } from "./components/onboarding-tour";
import { OnboardingWelcomeDialog } from "./components/onboarding-welcome-dialog";
import { ONBOARDING_STEPS } from "./onboarding-steps";
import { useOnboardingStore } from "./onboarding.store";
import type { OnboardingPreference } from "./types";

const ONBOARDING_VERSION = "v1";

function preferenceKey(userId: number | string) {
  return `equiprime.onboarding.${ONBOARDING_VERSION}.${userId}`;
}

function readPreference(userId: number | string) {
  try {
    return localStorage.getItem(preferenceKey(userId));
  } catch {
    return null;
  }
}

function savePreference(userId: number | string, preference: OnboardingPreference) {
  try {
    localStorage.setItem(preferenceKey(userId), preference);
  } catch {
    // Storage can be unavailable in restricted browser contexts. The tour
    // should still work for the current session rather than breaking the app.
  }
}

export function OnboardingRoot() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const isMobile = useIsMobile();
  const active = useOnboardingStore((state) => state.active);
  const currentIndex = useOnboardingStore((state) => state.currentIndex);
  const startTour = useOnboardingStore((state) => state.startTour);
  const stopTour = useOnboardingStore((state) => state.stopTour);
  const setCurrentIndex = useOnboardingStore((state) => state.setCurrentIndex);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const initializedUser = useRef<number | string | null>(null);

  const steps = useMemo(
    () =>
      ONBOARDING_STEPS.filter(
        (step) =>
          (!step.permission || can(step.permission)) &&
          !(isMobile && step.desktopOnly),
      ),
    [can, isMobile],
  );

  useEffect(() => {
    if (!user) {
      initializedUser.current = null;
      setWelcomeOpen(false);
      stopTour();
      return;
    }

    if (initializedUser.current === user.id) return;
    initializedUser.current = user.id;

    if (readPreference(user.id)) return;
    const timer = window.setTimeout(() => setWelcomeOpen(true), 450);
    return () => window.clearTimeout(timer);
  }, [stopTour, user]);

  useEffect(() => {
    if (!active || steps.length === 0) return;
    if (currentIndex >= steps.length) setCurrentIndex(0);
  }, [active, currentIndex, setCurrentIndex, steps.length]);

  if (!user) return null;

  const finish = (preference: OnboardingPreference) => {
    savePreference(user.id, preference);
    setWelcomeOpen(false);
    stopTour();
  };

  const start = () => {
    setWelcomeOpen(false);
    startTour();
  };

  return (
    <>
      <OnboardingWelcomeDialog
        open={welcomeOpen}
        stepCount={steps.length}
        onSkip={() => finish("skipped")}
        onStart={start}
      />

      {active && steps.length > 0 ? (
        <OnboardingTour
          steps={steps}
          currentIndex={Math.min(currentIndex, steps.length - 1)}
          onIndexChange={setCurrentIndex}
          onComplete={() => finish("completed")}
          onSkip={() => finish("skipped")}
        />
      ) : null}
    </>
  );
}
