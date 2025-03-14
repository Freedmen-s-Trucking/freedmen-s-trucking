import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { CustomFlowbiteTheme, Flowbite } from "flowbite-react";

const flowbittheme: CustomFlowbiteTheme = {
  button: {
    color: {
      primary: "bg-red-500 hover:bg-red-600",
    },
  },
};
const Component: React.FC = () => {
  return (
    <>
      <Flowbite theme={{ theme: flowbittheme }}>
        <Outlet />
        <TanStackRouterDevtools />
      </Flowbite>
    </>
  );
};
export const Route = createRootRoute({
  component: Component,
});
