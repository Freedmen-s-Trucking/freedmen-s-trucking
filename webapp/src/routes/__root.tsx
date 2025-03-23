import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import CustomProviders from "../provider/providers";

const Component: React.FC = () => {
  return (
    <>
      <CustomProviders>
        <Outlet />
        <TanStackRouterDevtools />
      </CustomProviders>
    </>
  );
};
export const Route = createRootRoute({
  component: Component,
});
