import { useState, useEffect, useRef } from "react";
import { Modal } from "flowbite-react";
import SignIn from "~/components/molecules/sign-in";
import { SignUp } from "~/components/molecules/sign-up";
import { useAppDispatch, useAppSelector } from "~/stores/hooks";
import { setRequestedAuthAction } from "~/stores/controllers/app-ctrl";
import { useAuth } from "~/hooks/use-auth";
import { AppUser } from "~/stores/controllers/auth-ctrl";

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { requestedAuthAction } = useAppSelector((state) => state.appCtrl);
  const [authAction, setAuthAction] = useState(
    requestedAuthAction?.type || null,
  );
  const uref = useRef<AppUser>();
  const dispatch = useAppDispatch();
  const onCloseModal = () => dispatch(setRequestedAuthAction(null));
  const onSignInComplete = () => {
    if (requestedAuthAction?.redirectToDashboard) {
      // TODO: Properly redirect to the right dashboard instead of relying on the main route redirection status.
      setTimeout(() => (location.href = "/"), 1000);
    }
    onCloseModal();
  };

  useEffect(() => {
    uref.current = user;
  }, [user]);

  useEffect(() => {
    setAuthAction(requestedAuthAction?.type || null);
  }, [dispatch, requestedAuthAction]);

  return (
    <>
      {children}
      <Modal
        show={authAction !== null}
        onClose={onCloseModal}
        size="lg"
        position="center"
        className="bg-black bg-opacity-30 [&>div>div]:bg-primary-50/95 [&>div]:mb-[1vh] [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end  md:[&>div]:h-auto"
      >
        <Modal.Header>
          {authAction === "login" ? "Login" : "Sign Up"}
        </Modal.Header>
        <Modal.Body className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
          <div className="w-full">
            {authAction === "login" && (
              <div className="space-y-6">
                <SignIn onComplete={onSignInComplete} />
                {user.isAnonymous && !requestedAuthAction?.strict && (
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    Not registered?&nbsp;
                    <button
                      onClick={() => setAuthAction("signup")}
                      className="font-bold text-secondary-900 hover:underline"
                    >
                      {">>"}Create account
                    </button>
                  </div>
                )}
              </div>
            )}
            {authAction === "signup" && (
              <div className="max-w-md space-y-6">
                <SignUp account={requestedAuthAction?.targetAccount} />
                {user.isAnonymous && !requestedAuthAction?.strict && (
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    Already have an account?&nbsp;
                    <button
                      onClick={() => setAuthAction("login")}
                      className="font-bold text-secondary-950 hover:underline"
                    >
                      {">>"}Login
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};
