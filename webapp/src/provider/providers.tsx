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
import { GOOGLE_MAPS_API_KEY, isDevMode } from "../utils/envs";
import { RemoteConfigProvider } from "./remote-config";
import { APIProvider } from "@vis.gl/react-google-maps";

const queryClient = new QueryClient();
export const RootProviders: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
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
      </APIProvider>
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
