import { FirebaseProvider } from "./firebase";
import { AnalyticsProvider } from "./analytics";
import { AuthCtx, AuthProvider } from "./auth";
import { PerformanceMonitoringProvider } from "./performance-monitoring";
import { MessagingProvider } from "./messaging";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "~/stores/store";
import { FireStoreProvider } from "./firestore";
import { StorageProvider } from "./storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GOOGLE_MAPS_API_KEY, isDevMode } from "~/utils/envs";
import { RemoteConfigCtx, RemoteConfigProvider } from "./remote-config";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useContext } from "react";
import { AuthWrapper } from "./auth-wrapper";

const queryClient = new QueryClient();

const LoadingProviders: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const remoteConfig = useContext(RemoteConfigCtx);
  const auth = useContext(AuthCtx);

  if (!remoteConfig || !auth?.user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <span className="border-primary-700/33 inline-block h-16 w-16 animate-spin rounded-full border-4 border-t-primary-700" />
      </div>
    );
  }
  return <>{children}</>;
};

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
                          <LoadingProviders>{children}</LoadingProviders>
                        </AuthProvider>
                      </PersistGate>
                    </Provider>
                  </RemoteConfigProvider>
                </FireStoreProvider>
              </StorageProvider>
            </PerformanceMonitoringProvider>
          </FirebaseProvider>
          {isDevMode && (
            <ReactQueryDevtools initialIsOpen={false} client={queryClient} />
          )}
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
      <AnalyticsProvider>
        <MessagingProvider>
          <AuthWrapper>{children}</AuthWrapper>
        </MessagingProvider>
      </AnalyticsProvider>
    </>
  );
};
