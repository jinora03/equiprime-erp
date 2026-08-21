import { create } from "zustand";

interface OnboardingState {
  active: boolean;
  currentIndex: number;
  startTour: () => void;
  stopTour: () => void;
  setCurrentIndex: (index: number) => void;
}

/**
 * Ephemeral tour state only. Completion is stored per user by OnboardingRoot;
 * keeping persistence out of this store avoids mixing accounts on shared demos.
 */
export const useOnboardingStore = create<OnboardingState>((set) => ({
  active: false,
  currentIndex: 0,
  startTour: () => set({ active: true, currentIndex: 0 }),
  stopTour: () => set({ active: false, currentIndex: 0 }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
}));
