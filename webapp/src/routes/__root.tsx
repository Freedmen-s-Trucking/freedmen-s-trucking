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
