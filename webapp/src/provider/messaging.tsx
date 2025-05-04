import {
  getMessaging,
  getToken,
  Messaging,
  onMessage,
} from "firebase/messaging";
import { createContext, useCallback, useEffect, useMemo } from "react";
import { FCM_VAPID_KEY } from "~/utils/envs";

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
      {children}
    </MessagingCtx.Provider>
  );
};

export { MessagingProvider, MessagingCtx };
