import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "@/route-tree.gen";
import "@/index.css";
import { RootProviders } from "./provider/providers";
import { useAppSelector } from "./stores/hooks";

// Create a new router instance
const router = createRouter({ routeTree, context: { user: null } });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const CustomRouter: React.FC = () => {
  const { user } = useAppSelector((state) => state.authCtrl);

  return <RouterProvider router={router} context={{ user }} />;
};

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RootProviders>
        <CustomRouter />
      </RootProviders>
    </StrictMode>,
  );
}
