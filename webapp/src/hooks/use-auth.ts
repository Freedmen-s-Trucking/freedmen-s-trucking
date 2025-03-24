import { useContext } from "react";
import { AuthProvider } from "../provider/auth";

export const useAuth = () => {
  const context = useContext(AuthProvider.Ctx);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  if (!context.user) {
    throw new Error("the user must be authenticated at least anonymously");
  }
  return context;
};
