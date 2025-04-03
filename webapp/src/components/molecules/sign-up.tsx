import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/use-auth";
import { FirebaseError } from "firebase/app";
import { UserCredential } from "firebase/auth";
import { motion } from "motion/react";
import { Label, Popover, Spinner } from "flowbite-react";
import { GoogleSignIn } from "./google-sign-in";
import {
  IoArrowForwardCircleOutline,
  IoCheckmark,
  IoClose,
} from "react-icons/io5";
import { FaHouseUser } from "react-icons/fa";
import { TbLayoutDashboard, TbTruckDelivery } from "react-icons/tb";
import { MdOutlinePostAdd } from "react-icons/md";
import { useDbOperations } from "../../hooks/use-firestore";
import { useStorageOperations } from "../../hooks/use-storage";
import { AccountType, DriverEntity } from "@freedman-trucking/types";
import { useAppDispatch } from "@/stores/hooks";
import { setUser } from "@/stores/controllers/auth-ctrl";
import { PrimaryButton, TextInput } from "../atoms";
import { setRequestedAuthAction } from "@/stores/controllers/app-ctrl";
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

const SignUpUser: React.FC<{
  onComplete: (userCredential: UserCredential) => void;
}> = ({ onComplete }) => {
  const { signUpWithEmailAndPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<null | string>(null);
  const [passwordSecurityLevel, setPasswordSecurityLevel] = useState({
    level: 0,
    hasLower: false,
    hasUpperCase: false,
    hasSymbol: false,
    hasNumber: false,
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Password and confirm password must match");
      return;
    }
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
      const res = await signUpWithEmailAndPassword(email, password);
      setError(null);
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
      setError("An error occurred while signing up with Google");
    } else {
      setError("Unknown Error occurred!");
    }
  };

  const onEmailChanged = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    setEmail(ev.target.value.toLowerCase());
  }, []);

  const onPasswordChanged = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    setPasswordSecurityLevel(getPasswordSecurityLevel(ev.target.value));
    setPassword(ev.target.value);
  }, []);

  const onConfirmPasswordChanged = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(ev.target.value);
    },
    [],
  );

  return (
    <div className="flex flex-col">
      <GoogleSignIn
        title="Sign Up With Google"
        onSignInCompleted={onComplete}
        onSignInError={onGoogleSignInError}
      />
      <h4 className="mb-2 flex min-w-60 items-center justify-center gap-4 text-lg font-bold text-secondary-800 opacity-20 before:h-[2px] before:flex-1 before:bg-secondary-800 after:h-[2px] after:flex-1 after:bg-secondary-800 md:justify-start">
        Or
      </h4>
      <form
        className="flex max-w-md flex-col gap-4 text-secondary-800"
        onSubmit={handleSubmit}
      >
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email1" value="Your email" />
          </div>
          <TextInput
            onChange={onEmailChanged}
            value={email}
            id="email1"
            autoComplete="email"
            type="email"
            placeholder="jhon@domain.com"
            required
          />
        </div>
        <div className="z-10">
          <div className="mb-2 block">
            <Label htmlFor="password1" value="Your password" />
          </div>
          <Popover
            tabIndex={-1}
            trigger="hover"
            className="absolute z-auto inline-block w-max max-w-[100vw] rounded-lg border border-gray-200 bg-primary-100 shadow-sm outline-none dark:border-gray-600 dark:bg-secondary-900 [&>div>div:first-child]:border-none [&>div>div:first-child]:bg-primary-100 [&>div>div:last-child]:-mt-[2px]"
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
              value={password}
              maxLength={32}
              autoComplete="new-password"
              id="password1"
              type="password"
              required
            />
          </Popover>
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password2" value="Confirm Your password" />
          </div>
          <TextInput
            onChange={onConfirmPasswordChanged}
            value={confirmPassword}
            maxLength={32}
            autoComplete="current-password"
            id="password2"
            type="password"
            required
            color={password === confirmPassword ? "gray" : "failure"}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
            animate={{
              opacity: 1,
              scaleY: 1,
              scaleX: 1,
              transition: { duration: 0.2, type: "spring", stiffness: 300 },
            }}
            className="py-2 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
        <PrimaryButton
          type="submit"
          isLoading={isLoading}
          className="self-center justify-self-end px-8 py-3 text-xl"
        >
          {isLoading && <Spinner aria-label="Spinner" size="sm" />}
          Sign Up{isLoading ? "..." : ""}
        </PrimaryButton>
      </form>
    </div>
  );
};

const AccountSelection: React.FC<{
  onAccountSelected: (type: AccountType) => void;
}> = ({ onAccountSelected }) => {
  return (
    <div className="mx-auto max-w-md space-y-4 text-secondary-950">
      <h1 className="text-center text-2xl font-bold ">
        Join as a client or driver
      </h1>
      <div className="flex space-x-4">
        <button
          type="button"
          className="flex flex-1 flex-col items-center space-x-3 rounded-lg border border-primary-700/90 px-4 py-2 font-bold text-primary-700 hover:bg-primary-700 hover:text-white"
          onClick={() => onAccountSelected("customer")}
        >
          <FaHouseUser className="text-7xl" />
          {/* TODO: Update this text. */}
          <span className="text-lg">
            I'm a client and would like to place orders
          </span>
        </button>
        <button
          type="button"
          className="flex flex-1 flex-col items-center space-x-3 rounded-lg border border-secondary-800/90 px-4 py-2 font-bold text-secondary-800 hover:bg-secondary-800 hover:text-white"
          onClick={() => onAccountSelected("driver")}
        >
          <TbTruckDelivery className="text-7xl" />
          {/* TODO: Update this text. */}
          <span className="text-lg">I'm a driver, Looking for work</span>
        </button>
      </div>
    </div>
  );
};

const Stepper: React.FC<{ activeStep: number; steps: string[] }> = ({
  activeStep,
  steps,
}) => {
  return (
    <>
      <ol className="shadow-xs mb-8 flex w-full items-center space-x-3 overflow-hidden rounded-lg text-center text-sm font-medium text-gray-500">
        {steps.map((step, index) => (
          <li
            key={index}
            className={`flex flex-row items-center ${index <= activeStep ? "text-secondary-950 " : "text-gray-500"}`}
          >
            <span className="flex flex-col items-center  justify-center">
              <span
                className={`mb-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${index === activeStep ? "" : "border"} ${index < activeStep ? "border-secondary-950 " : "border-gray-500"}`}
              >
                {index + 1}
              </span>
              <span className="line-clamp-2 h-[3em]">{step}</span>
            </span>
            {index + 1 < steps.length && (
              <span className={index === activeStep ? "text-gray-500" : ""}>
                <svg
                  className="ms-2 h-3 w-3 sm:ms-4 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 12 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m7 9 4-4-4-4M1 9l4-4-4-4"
                  />
                </svg>
              </span>
            )}
          </li>
        ))}
      </ol>
    </>
  );
};

const AdditionalInfo: React.FC<{ onAdditionalInfoAdded: () => void }> = ({
  onAdditionalInfoAdded,
}) => {
  const { user } = useAuth();
  const userInfo = user.info;
  const [fullName, setFullName] = useState<string>(userInfo.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState<string>(
    userInfo.phoneNumber || "",
  );
  const [driverLicense, setDriverLicense] = useState<File | null>(null);
  const [driverInsurance, setDriverInsurance] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const { insertUser, updateDriver } = useDbOperations();
  const { uploadCertificate } = useStorageOperations();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (userInfo.displayName) {
      setFullName(userInfo.displayName);
    }
    if (userInfo.phoneNumber) {
      setPhoneNumber(userInfo.phoneNumber);
    }
  }, [userInfo]);

  const onFullNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
  };

  const onPhoneNumberChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9\s-]/g, "");
    const formattedValue = value.replace(/-{2,}/g, "-");

    setPhoneNumber(formattedValue);
  };

  const onDriverLicenseChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setDriverLicense(files[0]);
    }
  };
  const onDriverInsuranceChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setDriverInsurance(files[0]);
    }
  };

  // const removeCertificate = (indexToRemove: number) => {
  //   const input = certificateInputRef.current;
  //   const files = input?.files;
  //   if (input && files) {
  //     const dt = new DataTransfer();
  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i];
  //       if (indexToRemove !== i) {
  //         dt.items.add(file);
  //       }
  //     }
  //     input.files = dt.files;
  //     setCertificates(Array.from(dt.files));
  //   }
  // };

  const [error, setError] = useState<null | string>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 1000));
      const driverLicensePath = await uploadCertificate(
        userInfo.uid,
        driverLicense!,
        "driver-license",
      );
      const driverInsurancePath = await uploadCertificate(
        userInfo.uid,
        driverInsurance!,
        "driver-insurance",
      );
      await insertUser(userInfo.uid, {
        displayName: fullName.trim(),
        phoneNumber: phoneNumber,
        isPhoneNumberVerified: false,
      });
      const driverInfo: DriverEntity = {
        driverLicense: {
          storagePath: driverLicensePath,
          status: "pending",
          expiry: "",
          issues: [],
        },
        driverInsurance: {
          storagePath: driverInsurancePath,
          status: "pending",
          expiry: "",
          issues: [],
        },
        verificationStatus: "pending",
        currentEarnings: 0,
        totalEarnings: 0,
        tasksCompleted: 0,
        activeTasks: 0,
        paymentMethods: [],
        withdrawalHistory: [],
      };

      await updateDriver(userInfo.uid, driverInfo);
      dispatch(
        setUser({
          ...user,
          driverInfo: driverInfo,
        }),
      );

      setError(null);
      onAdditionalInfoAdded();
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
  return (
    <div className="mx-auto max-w-md space-y-4 text-secondary-800">
      <h1 className="text-3xl font-bold">Additional Info</h1>
      <form className="flex flex-col space-y-2" onSubmit={handleSubmit}>
        <label className="block">
          <span className="block text-sm font-medium text-secondary-800">
            Full Name<span className="text-lg text-red-400">*</span>
          </span>
          <TextInput
            type="text"
            value={fullName}
            onChange={onFullNameChanged}
            required
            autoComplete="billing name"
            // className="mt-1 block w-full rounded-md border-gray-300 py-4 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-secondary-800">
            Phone Number
          </span>
          <TextInput
            type="text"
            autoComplete="tel"
            value={phoneNumber}
            onChange={onPhoneNumberChanged}
            // className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
        <span className="block text-sm font-medium text-secondary-800">
          Driver License
          <span className="text-lg text-red-400">*</span>
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-8">
          {driverLicense && (
            <div className="relative">
              <img
                src={URL.createObjectURL(driverLicense)}
                alt="Driver License"
                className="h-20 w-20 object-cover"
              />
              <button
                type="button"
                className="absolute right-0 top-0 overflow-hidden rounded-full bg-red-500 p-1 text-white"
                onClick={() => setDriverLicense(null)}
              >
                <IoClose />
              </button>
            </div>
          )}
          {driverLicense === null && (
            <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-500">
              <MdOutlinePostAdd className="text-2xl" />
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                multiple={false}
                required
                ref={certificateInputRef}
                onChange={onDriverLicenseChanged}
                className="absolute left-0 top-0 z-[-1] h-8 w-8 opacity-0"
              />
            </label>
          )}
        </div>
        <span className="block text-sm font-medium text-secondary-800">
          Driver Insurance
          <span className="text-lg text-red-400">*</span>
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-8">
          {driverInsurance && (
            <div className="relative">
              <img
                src={URL.createObjectURL(driverInsurance)}
                alt="Driver Insurance"
                className="h-20 w-20 object-cover"
              />
              <button
                type="button"
                className="absolute right-0 top-0 overflow-hidden rounded-full bg-red-500 p-1 text-white"
                onClick={() => setDriverInsurance(null)}
              >
                <IoClose />
              </button>
            </div>
          )}
          {driverInsurance === null && (
            <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-500">
              <MdOutlinePostAdd className="text-2xl" />
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                multiple={false}
                required
                ref={certificateInputRef}
                onChange={onDriverInsuranceChanged}
                className="absolute left-0 top-0 z-[-1] h-8 w-8 opacity-0"
              />
            </label>
          )}
        </div>
        <PrimaryButton
          type="submit"
          isLoading={isLoading}
          // className="disabled:bg-secondary-800 bg-secondary-950 flex flex-row items-center justify-center gap-2 rounded-md px-10 py-2 text-white disabled:cursor-not-allowed"
        >
          {isLoading && <Spinner aria-label="Spinner" size="sm" />}
          <span>Save{isLoading ? "..." : ""}</span>
        </PrimaryButton>
      </form>
      {error && <p className="py-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

const Confirm: React.FC<{ accountType: AccountType }> = ({ accountType }) => {
  const clientNextSteps = [
    {
      title: "Schedule Delivery",
      description: "Schedule your first delivery",
      Icon: (props: Record<string, unknown>) => <TbTruckDelivery {...props} />,
      link: "/preview/schedule-delivery",
    },
    {
      title: "Go to Dashboard",
      description: "Go to your dashboard",
      Icon: (props: Record<string, unknown>) => <FaHouseUser {...props} />,
      link: "/app/customer/dashboard",
    },
  ] as const;
  const driverNextSteps = [
    {
      title: "Go to Dashboard",
      description: "Go to your dashboard",
      Icon: (props: Record<string, unknown>) => (
        <TbLayoutDashboard {...props} />
      ),
      link: "/app/driver/dashboard",
    },
  ] as const;
  const dispatch = useAppDispatch();
  const onCloseModal = (link: string) => {
    dispatch(setRequestedAuthAction(null));
    location.href = link;
  };
  return (
    <div className="mx-auto max-w-md space-y-4 text-secondary-800">
      <h1 className="text-3xl font-bold">Sign Up Completed 🎉</h1>
      <p className="text-sm">
        You have successfully signed up as a {accountType}!
      </p>
      <br />
      <h3 className="text-sm">Now what next?</h3>
      <ol className="shadow-xs mb-8 flex w-full items-center space-x-3 overflow-hidden rounded-lg p-2 text-center text-sm font-medium">
        {(accountType === "customer" ? clientNextSteps : driverNextSteps).map(
          (step) => (
            <motion.li
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.975 }}
              key={step.title}
              className="rounded-lg border border-gray-500 p-3"
            >
              <button
                onClick={() => onCloseModal(step.link)}
                className="flex flex-col items-center"
              >
                <span className="flex w-full flex-row items-center justify-between">
                  <step.Icon className="text-5xl" />
                  <IoArrowForwardCircleOutline className="text-2xl" />
                </span>
                <span className="text-xl">{step.title}</span>
              </button>
            </motion.li>
          ),
        )}
      </ol>
    </div>
  );
};

const SignUp: React.FC<{ account?: AccountType }> = ({ account }) => {
  const steps = ["Account Type", "User Info", "Additional Info", "Confirm"];
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<number>();
  const [accountType, setAccountType] = useState<AccountType | undefined>(
    account,
  );

  const moveToNextStep = () => {
    setActiveStep((prev) => (prev || 0) + 1);
  };

  const onAccountSelected = (type: AccountType) => {
    setAccountType(type);
    setActiveStep((prev) => (prev || 0) + 1);
  };

  const onUserCreated = () => {
    // if (accountType === "driver" && !user.isAnonymous) {
    //   setActiveStep((prev) => prev + 1);
    // } else {
    //   setActiveStep((prev) => prev + 2);
    // }
  };

  useEffect(() => {
    console.log({ accountType, user, activeStep });
    if (accountType === "driver" && !user.isAnonymous) {
      if (activeStep && activeStep < 2) {
        setActiveStep(2);
      } else {
        setActiveStep(activeStep || 3);
      }
    } else if (!user.isAnonymous) {
      setActiveStep(3);
    } else if (accountType) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  }, [accountType, user, activeStep]);

  if (activeStep === undefined) return null;
  return (
    <div className="mx-auto max-w-md">
      <Stepper activeStep={activeStep} steps={steps} />
      {activeStep === 0 && (
        <AccountSelection onAccountSelected={onAccountSelected} />
      )}
      {activeStep === 1 && accountType && (
        <SignUpUser onComplete={onUserCreated} />
      )}
      {activeStep === 2 && accountType && (
        <AdditionalInfo onAdditionalInfoAdded={moveToNextStep} />
      )}
      {activeStep === 3 && accountType && <Confirm accountType={accountType} />}
    </div>
  );
};

export default SignUp;
