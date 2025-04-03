import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { AppUser } from "@/stores/controllers/auth-ctrl";
import { RouteProviders } from "@/provider/providers";

const Component: React.FC = () => {
  return (
    <>
      <RouteProviders>
        <Outlet />
      </RouteProviders>
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRouteWithContext<{ user: AppUser | null }>()({
  component: Component,
});
