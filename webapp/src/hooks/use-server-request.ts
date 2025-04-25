import { useMemo } from "react";
import { up } from "up-fetch";
import { VITE_SERVER_API } from "~/utils/envs";
import { useAuth } from "./use-auth";

export const useServerRequest = () => {
  const { getIDToken } = useAuth();

  const request = useMemo(() => {
    return up(fetch, async () => ({
      baseUrl: VITE_SERVER_API,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${await getIDToken()}` as const,
      },
    }));
  }, [getIDToken]);

  return request;
};
