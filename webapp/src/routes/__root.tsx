import {
  createRootRouteWithContext,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { AppUser } from "~/stores/controllers/auth-ctrl";
import { RouteProviders } from "~/provider/providers";
import { useEffect } from "react";
import { useAuth } from "~/hooks/use-auth";
import { Flowbite } from "flowbite-react";
import { getFlowbiteTheme } from "~/utils/functions";
import { APP_ENV } from "~/utils/envs";
import { useFCM } from "~/hooks/use-fcm";
import { useMutation } from "@tanstack/react-query";
import { useServerRequest } from "~/hooks/use-server-request";
import { differenceInMinutes } from "date-fns";

const Component: React.FC = () => {
  const { user } = useAuth();
  const routeState = useRouterState();

  // Add environment prefix to the document title
  useEffect(() => {
    if (!window.document.title) return;
    if (APP_ENV === "prod") return;
    if (window.document.title.toLowerCase().includes(APP_ENV.toLowerCase()))
      return;
    window.document.title = `${APP_ENV.toUpperCase()} - ${window.document.title}`;
  }, []);

  // Redirect to login if user is anonymous and trying to access protected routes
  useEffect(() => {
    if (
      (!user || user.isAnonymous) &&
      routeState.location.pathname.startsWith("/app")
    ) {
      window.location.href = "/";
    }
  }, [user, routeState]);

  const { requestNotificationPermission } = useFCM();
  const serverRequest = useServerRequest();

  const { mutate: updateFCMToken } = useMutation({
    mutationFn: async () => {
      const updateFCMToken = JSON.parse(
        localStorage.getItem("updateFCMToken") || "{}",
      );
      if (updateFCMToken.running) return;
      if (updateFCMToken.lastRun) {
        const lastRun = new Date(updateFCMToken.lastRun);
        const now = new Date();
        const diff = differenceInMinutes(now, lastRun);
        if (diff < 5) return;
      }
      updateFCMToken.running = true;
      localStorage.setItem("updateFCMToken", JSON.stringify(updateFCMToken));
      const token = await requestNotificationPermission();
      if (!token) return;
      await serverRequest("/user/update-fcm-token", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
    },
    onSuccess() {
      const updateFCMToken = JSON.parse(
        localStorage.getItem("updateFCMToken") || "{}",
      );
      updateFCMToken.running = false;
      updateFCMToken.lastRun = new Date().toISOString();
      localStorage.setItem("updateFCMToken", JSON.stringify(updateFCMToken));
    },
    onError() {
      const updateFCMToken = JSON.parse(
        localStorage.getItem("updateFCMToken") || "{}",
      );
      updateFCMToken.running = false;
      updateFCMToken.lastRun = new Date().toISOString();
      localStorage.setItem("updateFCMToken", JSON.stringify(updateFCMToken));
    },
  });

  // Request notification permission
  useEffect(() => {
    if (!user || user.isAnonymous || user.info.fcmToken) return;
    updateFCMToken();

    // In your main app code (e.g., React component)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Ask for notification permission via Service Worker
        registration.active?.postMessage({
          action: "requestNotificationPermission",
        });
      });
    }
  }, [updateFCMToken, user]);

  return (
    <>
      <RouteProviders>
        <Flowbite theme={{ mode: "light", theme: getFlowbiteTheme() }}>
          <div>
            <Outlet />
          </div>
        </Flowbite>
      </RouteProviders>
      <TanStackRouterDevtools />
    </>
  );
};

type AppContext = {
  user: AppUser | null;
  remoteConfigs: {
    canShowPreviewLandingPage?: boolean;
  };
};

export const Route = createRootRouteWithContext<AppContext>()({
  component: Component,
});
