import { useAuth } from "../../hooks/auth";
import { FirebaseError } from "firebase/app";
import { UserCredential } from "firebase/auth";

export const GoogleSignIn: React.FC<{
  onSignInError?: (error: unknown) => void;
  onSignInCompleted?: (credential: UserCredential) => void;
  title: string;
}> = ({ title, onSignInCompleted, onSignInError }) => {
  const { signInWithGoogle } = useAuth();

  const signIn = async () => {
    try {
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
    }
  };

  return (
    <button
      onClick={signIn}
      className="m-auto my-4 flex items-center justify-center gap-2 rounded-lg bg-white bg-gradient-to-r from-red-700 via-red-600 to-orange-500 px-5 py-2 text-center text-sm font-bold text-white transition-all duration-500 hover:bg-gradient-to-bl focus:outline-none"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="h-5 w-5"
      />
      {title}
    </button>
  );
};
