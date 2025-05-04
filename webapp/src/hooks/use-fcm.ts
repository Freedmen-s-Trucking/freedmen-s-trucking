import { useContext } from "react";
import { MessagingCtx } from "~/provider/messaging";

/**
 * Gets the messaging instance and ensures the type is correct.
 *
 * @returns Messaging instance.
 */
export const useFCM = () => {
  const context = useContext(MessagingCtx);
  if (!context) {
    throw new Error("useFCM must be used within a MessagingProvider");
  }

  return context;
};
