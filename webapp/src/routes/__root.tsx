import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createTheme, ThemeProvider } from "flowbite-react";

import CustomProviders from "../provider/providers";

const semanticColors = createTheme({});

const Component: React.FC = () => {
  return (
    <>
      <CustomProviders>
        <ThemeProvider theme={semanticColors}>
          <Outlet />
        </ThemeProvider>
        <TanStackRouterDevtools />
      </CustomProviders>
    </>
  );
};
export const Route = createRootRoute({
  component: Component,
});
