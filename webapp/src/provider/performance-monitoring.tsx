// import { onLCP, onINP, onCLS } from "web-vitals/attribution";
import { FirebasePerformance, getPerformance } from "firebase/performance";
import { createContext, useEffect, useMemo } from "react";

const PerformanceMonitoringCtx = createContext<FirebasePerformance | null>(
  null,
);

const PerformanceMonitoringProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const performance = useMemo(() => getPerformance(), []);

  useEffect(() => {
    // performance.dataCollectionEnabled = true;
    // performance.instrumentationEnabled = true;
    // onCLS(console.log);
    // onINP(console.log);
    // onLCP(console.log);
  }, [performance]);

  return (
    <PerformanceMonitoringCtx.Provider value={performance}>
      {children}
    </PerformanceMonitoringCtx.Provider>
  );
};

export { PerformanceMonitoringProvider, PerformanceMonitoringCtx };

// export const usePerformanceMonitoring = () => {
//   const context = useContext(PerformanceMonitoringCtx);
//   if (!context) {
//     throw new Error(
//       "usePerformanceMonitoring must be used within a PerformanceMonitoringProvider",
//     );
//   }
//   return context;
// };
