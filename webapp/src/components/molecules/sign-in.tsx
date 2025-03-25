import { ChangeEvent, useCallback, useRef, useState } from "react";
import { useAuth } from "../../hooks/use-auth";
import { FirebaseError } from "firebase/app";
import { UserCredential } from "firebase/auth";
import { Button, Label, Popover, Spinner, TextInput } from "flowbite-react";
import { GoogleSignIn } from "./google-sign-in";
import { IoCheckmark, IoClose } from "react-icons/io5";
const PASSWORD_SECURITY_LEVELS = [
  {
    label: "weak",
    tailwind: "bg-red-500",
  },
  {
    label: "medium",
    tailwind: "bg-yellow-500",
  },
  {
    label: "strong",
    tailwind: "bg-green-500",
  },
  {
    label: "very strong",
    tailwind: "bg-green-500",
  },
];

function getPasswordSecurityLevel(password: string) {
  const lowerCaseRegExp = /[a-z]/;
  const upperCaseRegExp = /[A-Z]/;
  const numberRegExp = /[0-9]/;
  const symbolRegExp = /[_\-!@#$%^&*(),.?":{}|<>/]/;
  let score = 0;
  const res = {
    level: 0,
    hasLower: false,
    hasUpperCase: false,
    hasSymbol: false,
    hasNumber: false,
  };

  score += Math.floor(password.length / 4);
  if (lowerCaseRegExp.test(password)) {
    score += 1 + Math.floor(score / 2);
    res.hasLower = true;
  }
  if (upperCaseRegExp.test(password)) {
    score += 1 + Math.floor(score / 2);
    res.hasUpperCase = true;
  }
  if (numberRegExp.test(password)) {
    score += 1 + Math.floor(score / 2);
    res.hasNumber = true;
  }
  if (symbolRegExp.test(password)) {
    score += 1 + Math.floor(score / 2);
    res.hasSymbol = true;
  }

  if (score < 8) {
    res.level = 0;
  } else if (score < 13) {
    res.level = 1;
  } else if (score < 20) {
    res.level = 2;
  } else if (score >= 20) {
    res.level = 3;
  }

  return res;
}

const SignIn: React.FC<{
  onComplete: (userCredential: UserCredential) => void;
}> = ({ onComplete }) => {
  const { signInWithEmailAndPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordPopoverOpen, setIsPasswordPopoverOpen] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<null | string>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [passwordSecurityLevel, setPasswordSecurityLevel] = useState({
    level: 0,
    hasLower: false,
    hasUpperCase: false,
    hasSymbol: false,
    hasNumber: false,
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !(
        passwordSecurityLevel.hasLower &&
        passwordSecurityLevel.hasNumber &&
        passwordSecurityLevel.hasUpperCase &&
        passwordSecurityLevel.hasSymbol &&
        password.length >= 8
      )
    ) {
      setError("Error in password validation");
      return;
    }
    try {
      setIsLoading(true);
      const res = await signInWithEmailAndPassword(email, password);
      onComplete(res);
    } catch (error: unknown) {
      const err = error as Record<string, unknown> | null | undefined;
      console.debug({ err });
      if (err && err.code === "auth/email-already-in-use") {
        setError("Email already in use.");
      } else {
        setError("Unknown Error Occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const onGoogleSignInError = (error: unknown) => {
    console.error(error);
    if (error instanceof FirebaseError) {
      setError("An error occurred while signing in with Google");
    } else {
      setError("Unknown Error occurred!");
    }
  };

  const onEmailChanged = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    setEmail(ev.target.value.toLowerCase());
  }, []);

  const onOpenChanged = useCallback(
    (open: React.SetStateAction<boolean>) => {
      const inputRef = passwordRef.current;
      const isOpen =
        open instanceof Function ? open(isPasswordPopoverOpen) : open;
      if (password.length > 0 && isOpen && inputRef) {
        setIsPasswordPopoverOpen(true);
        setTimeout(() => inputRef.focus(), 100);
      } else {
        setIsPasswordPopoverOpen(false);
      }
    },
    [passwordRef, isPasswordPopoverOpen, password],
  );

  const onPasswordChanged = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setPasswordSecurityLevel(getPasswordSecurityLevel(ev.target.value));
      setPassword(ev.target.value);
      onOpenChanged(ev.target.value.length > 0);
    },
    [onOpenChanged],
  );
  return (
    <div className="flex flex-col">
      <GoogleSignIn
        title="Sign In With Google"
        onSignInCompleted={onComplete}
        onSignInError={onGoogleSignInError}
      />
      <h4 className="mb-2 flex min-w-60 items-center justify-center gap-4 text-lg font-bold text-gray-700 before:h-[2px] before:flex-1 before:bg-gray-700 after:h-[2px] after:flex-1 after:bg-gray-700 md:justify-start">
        Or
      </h4>
      <form className="flex max-w-md flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email1" value="Your email" />
          </div>
          <TextInput
            onChange={onEmailChanged}
            value={email}
            autoComplete="email"
            id="email1"
            type="email"
            placeholder="jhon@domain.com"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password1" value="Your password" />
          </div>
          <Popover
            trigger="hover"
            onOpenChange={onOpenChanged}
            open={isPasswordPopoverOpen}
            content={
              <div className="space-y-2 p-3">
                {password.length < 8 && (
                  <h3 className="font-semibold text-red-500">
                    Must have at least 8 characters
                  </h3>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {PASSWORD_SECURITY_LEVELS.map((level, index) => (
                    <div
                      key={level.label}
                      className={`h-1 ${passwordSecurityLevel.level < index ? "bg-gray-200" : PASSWORD_SECURITY_LEVELS[passwordSecurityLevel.level].tailwind}`}
                    ></div>
                  ))}
                </div>
                <p>It's better to have:</p>
                <ul>
                  <li className="mb-1 flex items-center">
                    {(passwordSecurityLevel.hasLower &&
                      passwordSecurityLevel.hasUpperCase && (
                        <IoCheckmark className="text-2xl text-green-400" />
                      )) || <IoClose className="text-2xl text-red-400" />}
                    Upper & lower case letters
                  </li>
                  <li className="mb-1 flex items-center">
                    {(passwordSecurityLevel.hasNumber && (
                      <IoCheckmark className="text-2xl text-green-400" />
                    )) || <IoClose className="text-2xl text-red-400" />}
                    A numeric character (0-9)
                  </li>
                  <li className="mb-1 flex items-center">
                    {(passwordSecurityLevel.hasSymbol && (
                      <IoCheckmark className="text-2xl text-green-400" />
                    )) || <IoClose className="text-2xl text-red-400" />}
                    A symbol (#$&)
                  </li>
                  <li className="flex items-center">
                    {(password.length >= 12 && (
                      <IoCheckmark className="text-2xl text-green-400" />
                    )) || <IoClose className="text-2xl text-gray-300" />}
                    A longer password (min. 12 chars.)
                  </li>
                </ul>
              </div>
            }
          >
            <TextInput
              onChange={onPasswordChanged}
              ref={passwordRef}
              value={password}
              autoComplete="current-password"
              maxLength={32}
              id="password1"
              type="password"
              required
            />
          </Popover>
        </div>
        <Button color="dark" type="submit" disabled={isLoading}>
          {isLoading && <Spinner aria-label="Spinner" size="sm" />}
          Sign In{isLoading ? "..." : ""}
        </Button>
      </form>
      {error && <p className="py-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default SignIn;
