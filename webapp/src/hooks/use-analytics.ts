import { useContext } from "react";
import { AnalyticsProvider } from "../provider/analytics";

export const useAnalytics = () => {
  const context = useContext(AnalyticsProvider.Ctx);
  if (!context) {
    throw new Error("useAnalytics must be used within a AnalyticsProvider");
  }
  return context;
};
