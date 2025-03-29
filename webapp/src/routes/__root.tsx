import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createTheme, Flowbite, ThemeProps } from "flowbite-react";

import CustomProviders from "../provider/providers";

const semanticColors = createTheme<ThemeProps>({
  theme: {
    button: {
      color: {
        primary: "bg-primary text-white",
      }
    },
  },
});

const Component: React.FC = () => {
  return (
    <>
      <CustomProviders>
        <Flowbite theme={semanticColors}>
          <Outlet />
        </Flowbite>
        <TanStackRouterDevtools />
      </CustomProviders>
    </>
  );
};
export const Route = createRootRoute({
  component: Component,
});
