import { useContext } from "react";
import { AnalyticsCtx } from "../provider/analytics";

export const useAnalytics = () => {
  const context = useContext(AnalyticsCtx);
  if (!context) {
    throw new Error("useAnalytics must be used within a AnalyticsProvider");
  }
  return context;
};
