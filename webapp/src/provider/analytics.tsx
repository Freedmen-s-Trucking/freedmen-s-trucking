import { Analytics, getAnalytics, logEvent } from "firebase/analytics";
import { createContext, useEffect, useMemo } from "react";
// import { useFirebase } from "../hooks/firebase";
import { PAGE_ROUTES } from "../utils/constants";
import { useRouterState } from "@tanstack/react-router";

const AnalyticsCtx = createContext<Analytics | null>(null);

export const AnalyticsProvider: React.FC<{
  children: React.ReactNode;
}> & { Ctx: React.Context<Analytics | null> } = ({ children }) => {
  const analytics = useMemo(() => getAnalytics(), []);
  const { location } = useRouterState();

  useEffect(() => {
    const title = PAGE_ROUTES.find(
      (page) => page.href === location.pathname,
    )?.name;
    logEvent(analytics, "screen_view", {
      firebase_screen: location.pathname,
      firebase_screen_class: title,
    });
  }, [location.pathname, analytics]);

  return (
    <AnalyticsCtx.Provider value={analytics}>{children}</AnalyticsCtx.Provider>
  );
};

AnalyticsProvider.Ctx = AnalyticsCtx;
