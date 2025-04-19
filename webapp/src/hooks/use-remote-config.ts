import { useContext } from "react";
import { RemoteConfigCtx } from "~/provider/remote-config";
import { getBoolean, getNumber, getString } from "firebase/remote-config";
import { RemoteConfigKeys } from "~/utils/constants";
import { DEFAULT_REMOTE_CONFIG_MAP } from "~/utils/constants";

/**
 * Gets the remote config value of the provided key and ensures the type is correct.
 *
 * @param key Remote config key
 * @returns Remote config value of the provided key.
 */
export const useGetRemoteConfig = <T extends RemoteConfigKeys>(
  key: T,
): (typeof DEFAULT_REMOTE_CONFIG_MAP)[T] => {
  const context = useContext(RemoteConfigCtx);
  if (!context) {
    throw new Error(
      "useGetRemoteConfig must be used within a RemoteConfigProvider",
    );
  }

  switch (typeof DEFAULT_REMOTE_CONFIG_MAP[key]) {
    case "boolean":
      return getBoolean(context, key) as (typeof DEFAULT_REMOTE_CONFIG_MAP)[T];
    case "number":
      return getNumber(context, key) as (typeof DEFAULT_REMOTE_CONFIG_MAP)[T];
    case "string":
    default:
      return getString(context, key) as (typeof DEFAULT_REMOTE_CONFIG_MAP)[T];
  }
};
