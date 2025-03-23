import { FirebaseProvider } from "./firebase";
import { AnalyticsProvider } from "./analytics";
import { AuthProvider } from "./auth";
import { PerformanceMonitoringProvider } from "./performance-monitoring";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../stores/store";

const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <FirebaseProvider>
        <PerformanceMonitoringProvider>
          <AnalyticsProvider>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <AuthProvider>{children}</AuthProvider>
              </PersistGate>
            </Provider>
          </AnalyticsProvider>
        </PerformanceMonitoringProvider>
      </FirebaseProvider>
    </>
  );
};

export default Providers;
