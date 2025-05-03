import { useMemo } from "react";
import { up } from "up-fetch";
import { SERVER_API_ENDPOINT } from "~/utils/envs";
import { useAuth } from "./use-auth";

export const useServerRequest = () => {
  const { getIDToken } = useAuth();

  const request = useMemo(() => {
    return up(fetch, async () => ({
      baseUrl: `${SERVER_API_ENDPOINT}/v1`,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${await getIDToken()}` as const,
      },
    }));
  }, [getIDToken]);

  return request;
};
