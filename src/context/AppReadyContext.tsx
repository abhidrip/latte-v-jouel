import React, { createContext, useCallback, useContext, useState } from 'react';

type AppReadyContextValue = {
  /** true once the loading screen has finished and dismissed itself */
  isAppReady: boolean;
  /** called by LoadingScreen when its exit animation completes */
  markAppReady: () => void;
};

const AppReadyCtx = createContext<AppReadyContextValue | null>(null);

export function AppReadyProvider({ children }: { children: React.ReactNode }) {
  const [isAppReady, setIsAppReady] = useState(false);
  const markAppReady = useCallback(() => setIsAppReady(true), []);

  return (
    <AppReadyCtx.Provider value={{ isAppReady, markAppReady }}>
      {children}
    </AppReadyCtx.Provider>
  );
}

export function useAppReady() {
  const ctx = useContext(AppReadyCtx);
  if (!ctx) throw new Error('useAppReady must be used within <AppReadyProvider>');
  return ctx;
}
