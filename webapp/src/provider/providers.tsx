import { FirebaseProvider } from "./firebase";
import { AnalyticsProvider } from "./analytics";
import { AuthProvider } from "./auth";
import { PerformanceMonitoringProvider } from "./performance-monitoring";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../stores/store";
import { FireStoreProvider } from "./firestore";
import { StorageProvider } from "./storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isDevMode } from "../utils/envs";

const queryClient = new QueryClient();
const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <FirebaseProvider>
        <PerformanceMonitoringProvider>
          <StorageProvider>
            <FireStoreProvider>
              <AnalyticsProvider>
                <Provider store={store}>
                  <PersistGate loading={null} persistor={persistor}>
                    <AuthProvider>
                      <QueryClientProvider client={queryClient}>
                        {children}
                        {isDevMode && (
                          <ReactQueryDevtools initialIsOpen={false} />
                        )}
                      </QueryClientProvider>
                    </AuthProvider>
                  </PersistGate>
                </Provider>
              </AnalyticsProvider>
            </FireStoreProvider>
          </StorageProvider>
        </PerformanceMonitoringProvider>
      </FirebaseProvider>
    </>
  );
};

export default Providers;
