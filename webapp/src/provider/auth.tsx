import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { createContext, useEffect, useMemo } from "react";
import { DriverEntity, UserEntity } from "@freedmen-s-trucking/types";
import { isDevMode } from "~/utils/envs";
import { useDbOperations } from "~/hooks/use-firestore";
import { AppUser, setUser } from "~/stores/controllers/auth-ctrl";
import { useAppDispatch, useAppSelector } from "~/stores/hooks";

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

const AuthCtx = createContext<AppAuth>({} as AppAuth);

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

const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const auth = useMemo(() => {
    const _auth = getAuth();
    if (isDevMode) {
      connectAuthEmulator(_auth, "http://127.0.0.1:9099");
    }
    return _auth;
  }, []);
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
    const unSubscribe = auth.onAuthStateChanged(async (user) => {
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
          authenticateAccessCode: "",
          firstName: "",
          lastName: "",
          birthDate: null,
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
            getIDToken: user.getIdToken.bind(user),
          }),
        );
      } else {
        console.log("user logged out, Sign in anonymously");
        signInAnonymously(auth);
      }
    });
    return unSubscribe;
  }, [auth, dispatch, getUser, getDriver, createUser]);

  return <AuthCtx.Provider value={authValue}>{children}</AuthCtx.Provider>;
};

export { AuthCtx, AuthProvider };
