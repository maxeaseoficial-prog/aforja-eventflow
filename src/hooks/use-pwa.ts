import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PWAState {
  deferredPrompt: any;
  isInstallable: boolean;
  isInstalled: boolean;
  needsUpdate: boolean;
  setDeferredPrompt: (prompt: any) => void;
  setNeedsUpdate: (needsUpdate: boolean) => void;
  checkIsInstalled: () => void;
}

export const usePWAStore = create<PWAState>()(
  persist(
    (set, get) => ({
      deferredPrompt: null,
      isInstallable: false,
      isInstalled: false,
      needsUpdate: false,
      setDeferredPrompt: (prompt: any) => set({ 
        deferredPrompt: prompt, 
        isInstallable: !!prompt 
      }),
      setNeedsUpdate: (needsUpdate: boolean) => set({ needsUpdate }),
      checkIsInstalled: () => {
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                           (window.navigator as any).standalone || 
                           document.referrer.includes("android-app://");
        set({ isInstalled: isStandalone });
      },
    }),
    {
      name: "forja-pwa-state",
      // Only persist essential flags if needed, but deferredPrompt can't be persisted
      partialize: (state) => ({ isInstalled: state.isInstalled }),
    }
  )
);
