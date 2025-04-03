import { DEFAULT_REMOTE_CONFIG_MAP } from "@/utils/constants";
import { APP_ENV, isDevMode } from "@/utils/envs";
import {
  RemoteConfig,
  getRemoteConfig,
  fetchAndActivate,
  getAll,
} from "firebase/remote-config";
import { createContext, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

const RemoteConfigCtx = createContext<RemoteConfig | null>(null);

// The default and recommended production fetch interval for Remote Config is 12 hours
const twelveHoursMillis = 43200000;
const oneHourMillis = 3600000;
const oneMinuteMillis = 60000;

export const RemoteConfigProvider: React.FC<{
  children: React.ReactNode;
}> & { Ctx: React.Context<RemoteConfig | null> } = ({ children }) => {
  const remoteConfig = useMemo(() => getRemoteConfig(), []);

  useEffect(() => {
    remoteConfig.settings.minimumFetchIntervalMillis = isDevMode
      ? oneMinuteMillis
      : APP_ENV === "dev"
        ? oneHourMillis
        : twelveHoursMillis;

    remoteConfig.defaultConfig = DEFAULT_REMOTE_CONFIG_MAP;
  }, [remoteConfig]);

  const { isLoading } = useQuery({
    queryKey: ["remote-config"],
    queryFn: async () => {
      await fetchAndActivate(remoteConfig);
      return getAll(remoteConfig);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <span className="border-primary-700/33 inline-block h-16 w-16 animate-spin rounded-full border-4 border-t-primary-700" />
      </div>
    );
  }
  return (
    <RemoteConfigCtx.Provider value={remoteConfig}>
      {children}
    </RemoteConfigCtx.Provider>
  );
};

RemoteConfigProvider.Ctx = RemoteConfigCtx;
