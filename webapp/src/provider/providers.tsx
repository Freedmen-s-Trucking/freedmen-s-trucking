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
import { RemoteConfigProvider } from "./remote-config";

const queryClient = new QueryClient();
export const RootProviders: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <FirebaseProvider>
          <PerformanceMonitoringProvider>
            <StorageProvider>
              <FireStoreProvider>
                <RemoteConfigProvider>
                  <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                      <AuthProvider>
                        {children}
                        {isDevMode && (
                          <ReactQueryDevtools
                            initialIsOpen={false}
                            client={queryClient}
                          />
                        )}
                      </AuthProvider>
                    </PersistGate>
                  </Provider>
                </RemoteConfigProvider>
              </FireStoreProvider>
            </StorageProvider>
          </PerformanceMonitoringProvider>
        </FirebaseProvider>
      </QueryClientProvider>
    </>
  );
};

export const RouteProviders: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </>
  );
};
