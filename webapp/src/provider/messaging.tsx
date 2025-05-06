import {
  getMessaging,
  getToken,
  Messaging,
  onMessage,
} from "firebase/messaging";
import { createContext, useCallback, useEffect, useMemo } from "react";
import { FCM_VAPID_KEY } from "~/utils/envs";
import { useServerRequest } from "~/hooks/use-server-request";
import { useMutation } from "@tanstack/react-query";
import { differenceInHours } from "date-fns";
import { useAuth } from "~/hooks/use-auth";
import { generateBrowserFingerprint } from "~/utils/functions";
import { useAppDispatch, useAppSelector } from "~/stores/hooks";
import {
  setDeviceFCMTokenLastUpdated,
  setDeviceFingerprint,
} from "~/stores/controllers/settings-ctrl";

// Register the service worker.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered:", registration);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

// Create a context for the messaging instance.
const MessagingCtx = createContext<{
  messaging: Messaging | null;
  requestNotificationPermission: () => Promise<string | null>;
}>({
  messaging: null,
  requestNotificationPermission: async () => null,
});

const MessagingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const messaging = useMemo(() => getMessaging(), []);

  const requestNotificationPermission = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");

        // Get FCM token (required to send messages to this device)
        const token = await getToken(messaging, {
          vapidKey: FCM_VAPID_KEY, // Optional (only needed for web push)
        });

        localStorage.setItem("fcmToken", token);
        return token;
      } else {
        console.log("Notification permission denied.");
      }
    } catch (error) {
      console.error("Error getting permission:", error);
    }

    return null;
  }, [messaging]);

  useEffect(() => {
    // Listen for messages while the app is open
    onMessage(messaging, (payload) => {
      console.log("Message received:", payload);

      // Display notification
      const { title, body } = payload.notification || {};
      new Notification(title || "", { body });
    });
  }, [messaging]);

  return (
    <MessagingCtx.Provider value={{ messaging, requestNotificationPermission }}>
      <UpdateFCMToken
        requestNotificationPermission={requestNotificationPermission}
      />
      {children}
    </MessagingCtx.Provider>
  );
};

export { MessagingProvider, MessagingCtx };

const UpdateFCMToken = ({
  requestNotificationPermission,
}: {
  requestNotificationPermission: () => Promise<string | null>;
}) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { deviceFingerprint, deviceFCMTokenLastUpdated } = useAppSelector(
    (state) => state.settingsCtrl,
  );
  const serverRequest = useServerRequest();
  const { mutate: updateFCMToken } = useMutation({
    mutationFn: async () => {
      let fingerprint = deviceFingerprint;
      if (!fingerprint) {
        fingerprint = `${generateBrowserFingerprint()}`;
        dispatch(setDeviceFingerprint(fingerprint));
      }
      if (deviceFCMTokenLastUpdated) {
        const lastRun = new Date(deviceFCMTokenLastUpdated);
        const now = new Date();
        const diff = differenceInHours(now, lastRun);
        if (diff < 2) return;
      }

      const token = await requestNotificationPermission();
      if (!token) return;
      await serverRequest("/user/update-fcm-token", {
        method: "POST",
        body: {
          token,
          deviceFingerprint: fingerprint,
        },
      });
    },
    onSuccess() {
      dispatch(setDeviceFCMTokenLastUpdated(new Date().toISOString()));
    },
  });

  // Request notification permission
  useEffect(() => {
    if (!user || user.isAnonymous) {
      return;
    }
    updateFCMToken();
  }, [updateFCMToken, user]);

  return null;
};
