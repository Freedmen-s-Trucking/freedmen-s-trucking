import { useAuth } from "../../hooks/use-auth";
import { FirebaseError } from "firebase/app";
import { UserCredential } from "firebase/auth";
import { useState } from "react";
import { PrimaryButton } from "../atoms/base";

export const GoogleSignIn: React.FC<{
  onSignInError?: (error: unknown) => void;
  onSignInCompleted?: (credential: UserCredential) => void;
  title: string;
}> = ({ title, onSignInCompleted, onSignInError }) => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithGoogle();
      if (onSignInCompleted) {
        onSignInCompleted(result);
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.error(error);
        if (onSignInError) {
          onSignInError(error);
        }
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PrimaryButton
      onClick={signIn}
      isLoading={isLoading}
      className="m-auto my-4 flex items-center justify-center gap-4 rounded-lg bg-white bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-5 py-3 text-center text-lg font-bold text-white transition-all duration-500 hover:bg-gradient-to-bl focus:outline-none disabled:opacity-80"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="h-5 w-5"
      />
      {title}
    </PrimaryButton>
  );
};
