import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  signInWithEmailAndPassword,
  UserCredential,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { createContext, useEffect, useMemo } from "react";
// import { useFirebase } from "../hooks/firebase";
import { useAppDispatch, useAppSelector } from "../../stores/hooks";
import { AppUser, setUser } from "../../stores/controllers/auth-ctrl";
import { DriverEntity, UserEntity } from "@freedman-trucking/types";
import { useDbOperations } from "../../hooks/use-firestore";
import { AuthWrapper } from "./auth-wrapper";

interface AppAuth {
  user: AppUser;
  signOut: () => Promise<void>;
  signUpWithEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<UserCredential>;
  signInWithEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
}

const AuthCtx = createContext<AppAuth | null>(null);

const _signOut = async (): Promise<void> => {
  const auth = getAuth();
  await auth.signOut();
};

const _signInWithEmailAndPassword = (
  email: string,
  password: string,
): Promise<UserCredential> => {
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password);
};

const _signUpWithEmailAndPassword = (
  email: string,
  password: string,
): Promise<UserCredential> => {
  const auth = getAuth();
  return createUserWithEmailAndPassword(auth, email, password);
};

const _signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  // provider.addScope("https://www.googleapis.com/auth/contacts.readonly"); // [see more here]:https://developers.google.com/identity/protocols/googlescopes
  const result = await signInWithPopup(auth, provider);
  // const result = await signInWithRedirect(auth, provider);
  return result;
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> & { Ctx: React.Context<AppAuth | null> } = ({ children }) => {
  const auth = useMemo(() => getAuth(), []);
  const { user } = useAppSelector((state) => state.authCtrl);
  const { createUser, getDriver, getUser } = useDbOperations();

  useEffect(() => {
    auth.useDeviceLanguage();
  }, [auth]);

  const authValue = useMemo(() => {
    return {
      user: user!,
      signOut: _signOut,
      signInWithEmailAndPassword: _signInWithEmailAndPassword,
      signUpWithEmailAndPassword: _signUpWithEmailAndPassword,
      signInWithGoogle: _signInWithGoogle,
    };
  }, [user]);

  const dispatch = useAppDispatch();
  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        let dbUser: UserEntity = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName ?? user.email?.split("@")[0] ?? "",
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          isPhoneNumberVerified: !!user.phoneNumber,
          isEmailVerified: user.emailVerified,
          authMethods: user.providerData.map((provider) => ({
            provider: provider.providerId,
            providerRowData: { ...provider },
          })),
          createdAt: user.metadata.creationTime || null,
          updatedAt: user.metadata.creationTime || null,
        };

        let driverInfo: DriverEntity | null = null;
        if (!user.isAnonymous) {
          try {
            const firestoreUser = await getUser(dbUser.uid);
            if (firestoreUser) {
              dbUser = {
                ...dbUser,
                ...firestoreUser,
              };
            } else {
              await createUser(dbUser);
            }
          } catch (error) {
            console.error("Error getting user:", error);
          }
          try {
            driverInfo = await getDriver(dbUser.uid);
          } catch (error) {
            console.error("Error getting user:", error);
          }
        }
        dispatch(
          setUser({
            info: dbUser,
            driverInfo: driverInfo ?? undefined,
            isAnonymous: user.isAnonymous,
            isEmailVerified: user.emailVerified,
            meta: {
              lastSignInTime: user.metadata.lastSignInTime,
              creationTime: user.metadata.creationTime,
            },
            providerData: user.providerData,
          }),
        );
      } else {
        console.log("user logged out, Sign in anonymously");
        signInAnonymously(auth);
      }
    });
  }, [auth, dispatch, getUser, getDriver, createUser]);

  if (user == null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <span className="border-primary-700/33 inline-block h-16 w-16 animate-spin rounded-full border-4 border-t-primary-700" />
      </div>
    );
  }
  return (
    <AuthCtx.Provider value={authValue}>
      <AuthWrapper>{children}</AuthWrapper>
    </AuthCtx.Provider>
  );
};

AuthProvider.Ctx = AuthCtx;
