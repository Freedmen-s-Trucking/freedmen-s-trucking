import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "~/route-tree.gen";
import "~/index.css";
import { RootProviders } from "./provider/providers";
import { useGetRemoteConfig } from "./hooks/use-remote-config";
import { RemoteConfigKeys } from "./utils/constants";
import { useAuth } from "./hooks/use-auth";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { user: null, remoteConfigs: {} },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const CustomRouter: React.FC = () => {
  const { user } = useAuth();
  const canShowPreviewLandingPage = useGetRemoteConfig(
    RemoteConfigKeys.can_show_preview_landing_page,
  );

  return (
    <RouterProvider
      router={router}
      context={{ user, remoteConfigs: { canShowPreviewLandingPage } }}
    />
  );
};

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <RootProviders>
        <CustomRouter />
      </RootProviders>
    </StrictMode>,
  );
}
