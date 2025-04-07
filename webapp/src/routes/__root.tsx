import {
  createRootRouteWithContext,
  Outlet,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { AppUser } from "~/stores/controllers/auth-ctrl";
import { RouteProviders } from "~/provider/providers";
import { useAppSelector } from "~/stores/hooks";
import { useEffect } from "react";

const Component: React.FC = () => {
  const { user } = useAppSelector((state) => state.authCtrl);
  const router = useRouter();
  const routeState = useRouterState();

  useEffect(() => {
    if (
      (!user || user.isAnonymous) &&
      routeState.location.pathname.startsWith("/app")
    ) {
      router.navigate({ to: "/" });
    }
  }, [user, router, routeState]);

  return (
    <>
      <RouteProviders>
        <Outlet />
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
