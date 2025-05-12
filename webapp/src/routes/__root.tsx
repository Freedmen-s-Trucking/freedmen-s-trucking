import {
  createRootRouteWithContext,
  NotFoundRouteComponent,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { AppUser } from "~/stores/controllers/auth-ctrl";
import { RouteProviders } from "~/provider/providers";
import { useEffect } from "react";
import { useAuth } from "~/hooks/use-auth";
import { Badge, Flowbite } from "flowbite-react";
import { getFlowbiteTheme } from "~/utils/functions";
import { APP_ENV } from "~/utils/envs";
import { motion } from "motion/react";

const RootRouteComponent: React.FC = () => {
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
      {APP_ENV !== "prod" && (
        <motion.div
          className="fixed right-5 top-3 z-50 translate-x-1/2 rotate-[52deg]"
          initial={{ opacity: 0, scale: 0.7, rotate: 52, translateX: "50%" }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <Badge
            color="warning"
            className="flex w-32 flex-col items-center justify-center"
          >
            <span className="block text-center text-[9px]">mode</span>
            <span className="block text-center">{APP_ENV.toUpperCase()}</span>
          </Badge>
        </motion.div>
      )}
      <RouteProviders>
        <Flowbite theme={{ mode: "light", theme: getFlowbiteTheme() }}>
          <div className="h-full w-full overflow-auto">
            <Outlet />
          </div>
        </Flowbite>
      </RouteProviders>
      <TanStackRouterDevtools />
    </>
  );
};

const NotFoundRoute: NotFoundRouteComponent = ({ data }) => {
  console.log({ data });
  return (
    <motion.div
      className="flex h-full w-full flex-1 flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <span className="block text-center text-5xl">Not Found</span>
      <button
        className="btn btn-primary"
        onClick={() => (window.location.href = "/")}
      >
        Go Home
      </button>
    </motion.div>
  );
};

type AppContext = {
  user: AppUser | null;
  remoteConfigs: {
    canShowPreviewLandingPage?: boolean;
  };
};

export const Route = createRootRouteWithContext<AppContext>()({
  component: RootRouteComponent,
  notFoundComponent: NotFoundRoute,
});
