import { useContext } from "react";
import { AuthCtx } from "~/provider/auth";

export const useAuth = () => {
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  if (!context.user) {
    throw new Error("the user must be authenticated at least anonymously");
  }
  return context;
};
