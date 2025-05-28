import {
  AccountType,
  ApiReqProcessIdentityVerificationWithAuthenticate,
  apiResProcessIdentityVerificationWithAuthenticate,
  DriverEntity,
  VehicleType,
} from "@freedmen-s-trucking/types";
import { subYears } from "date-fns";
import { FirebaseError } from "firebase/app";
import { UserCredential } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { Checkbox, Dropdown, Label, Spinner, Tooltip } from "flowbite-react";
import { motion } from "motion/react";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { FaHouseUser } from "react-icons/fa";
import {
  IoArrowForwardCircleOutline,
  IoCheckmark,
  IoClose,
} from "react-icons/io5";
import { MdOutlinePostAdd } from "react-icons/md";
import { TbLayoutDashboard, TbTruckDelivery } from "react-icons/tb";
import { PrimaryButton, TextInput } from "~/components/atoms";
import { useAuth } from "~/hooks/use-auth";
import { useDbOperations } from "~/hooks/use-firestore";
import { useServerRequest } from "~/hooks/use-server-request";
import { useStorageOperations } from "~/hooks/use-storage";
import { setRequestedAuthAction } from "~/stores/controllers/app-ctrl";
import { setUser } from "~/stores/controllers/auth-ctrl";
import { useAppDispatch } from "~/stores/hooks";
import { vehicleTypes } from "~/utils/constants";
import { PUBLIC_WEBAPP_URL } from "~/utils/envs";
import { getPasswordSecurityLevel } from "~/utils/functions";
import { CustomPopover } from "../atoms/popover";
import { GoogleSignIn } from "./google-sign-in";

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

function getFirebaseErrorMessage(error: FirebaseError) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "The email address is already in use.";
    case "auth/invalid-email":
      return "The email address is malformed.";
    case "auth/weak-password":
      return "The password is too weak. Please use a stronger password.";
    case "auth/operation-not-allowed":
      return "Operation not allowed. Please contact support.";
    case "auth/too-many-requests":
      return "Too many requests. Please try again later.";
    case "auth/wrong-password":
      return "Wrong password.";
    case "auth/user-disabled":
      return "User disabled.";
    case "auth/user-not-found":
      return "User not found.";
  }
  return null;
}

const SignUpUser: React.FC<{
  onComplete: (userCredential: UserCredential) => void;
}> = ({ onComplete }) => {
  const { signUpWithEmailAndPassword, signInWithEmailAndPassword } = useAuth();
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
    lowerRequired: true,
    upperRequired: true,
    symbolRequired: true,
    numberRequired: false,
    remainingLength: 0,
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Password and confirm password must match");
      return;
    }
    if (
      (!passwordSecurityLevel.hasLower &&
        passwordSecurityLevel.lowerRequired) ||
      (!passwordSecurityLevel.hasNumber &&
        passwordSecurityLevel.numberRequired) ||
      (!passwordSecurityLevel.hasUpperCase &&
        passwordSecurityLevel.upperRequired) ||
      (!passwordSecurityLevel.hasSymbol &&
        passwordSecurityLevel.symbolRequired) ||
      passwordSecurityLevel.remainingLength > 0
    ) {
      setError("Error in password validation");
      return;
    }
    try {
      setIsLoading(true);
      const res = await signUpWithEmailAndPassword(email, password);
      setError(null);
      setTimeout(() => onComplete(res), 2000);
    } catch (error: unknown) {
      setIsLoading(false);
      const err = error as Record<string, unknown> | null | undefined;
      console.debug({ err });
      if (!(error instanceof FirebaseError)) {
        setError("Unknown Error Occurred.");
        return;
      }
      if (error.code === "auth/email-already-in-use") {
        return signInWithEmailAndPassword(email, password)
          .then(onComplete)
          .catch((e) =>
            setError(getFirebaseErrorMessage(e) || "Unknown Error Occurred."),
          );
      }
      const errMsg = getFirebaseErrorMessage(error);
      if (errMsg) {
        setError(errMsg);
        return;
      }
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
          <CustomPopover
            autoFocus={false}
            trigger={["hover", "focus"]}
            hardClose
            className="absolute z-auto inline-block w-max max-w-[100vw] rounded-lg border border-gray-200 bg-primary-100 shadow-sm outline-none dark:border-gray-600 dark:bg-secondary-900 [&>div>div:first-child]:border-none [&>div>div:first-child]:bg-primary-100 [&>div>div:last-child]:-mt-[2px]"
            content={
              <div className="space-y-2 p-3">
                {passwordSecurityLevel.remainingLength > 0 && (
                  <h3 className="font-semibold text-red-500">
                    Must have at least{" "}
                    {password.length + passwordSecurityLevel.remainingLength}{" "}
                    characters
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
                      )) || (
                      <IoClose
                        className={`text-2xl ${passwordSecurityLevel.lowerRequired && passwordSecurityLevel.upperRequired ? "text-red-400" : "text-gray-300"}`}
                      />
                    )}
                    Upper & lower case letters
                  </li>
                  <li className="mb-1 flex items-center">
                    {(passwordSecurityLevel.hasSymbol && (
                      <IoCheckmark className="text-2xl text-green-400" />
                    )) || (
                      <IoClose
                        className={`text-2xl ${passwordSecurityLevel.symbolRequired ? "text-red-400" : "text-gray-300"}`}
                      />
                    )}
                    A symbol (#$&)
                  </li>
                  <li className="mb-1 flex items-center">
                    {(passwordSecurityLevel.hasNumber && (
                      <IoCheckmark className="text-2xl text-green-400" />
                    )) || (
                      <IoClose
                        className={`text-2xl ${passwordSecurityLevel.numberRequired ? "text-red-400" : "text-gray-300"}`}
                      />
                    )}
                    A numeric character (0-9)
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
              autoComplete="current-password"
              id="password1"
              type="password"
              required
            />
          </CustomPopover>
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password2" value="Confirm Your password" />
          </div>
          <TextInput
            onChange={onConfirmPasswordChanged}
            value={confirmPassword}
            maxLength={32}
            autoComplete="new-password"
            id="password2"
            type="password"
            required
            // color={password === confirmPassword ? "gray" : "failure"}
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
              <span className="line-clamp-2 h-[3em] text-xs">{step}</span>
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
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>(
    user.info.phoneNumber || "",
  );
  const [driverVehicle, setDriverVehicle] = useState<VehicleType | null>(null);
  const [driverInsurance, setDriverInsurance] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const { insertUser, updateDriver } = useDbOperations();
  const { uploadCertificate } = useStorageOperations();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user.info.firstName) {
      setFirstName(user.info.firstName);
    }
    if (user.info.lastName) {
      setLastName(user.info.lastName);
    }
    if (user.info.birthDate instanceof Timestamp) {
      setBirthDate(user.info.birthDate.toDate());
    } else if (typeof user.info.birthDate === "string") {
      setBirthDate(new Date(user.info.birthDate));
    }
    if (user.info.phoneNumber) {
      setPhoneNumber(user.info.phoneNumber);
    }
    if (user.driverInfo?.vehicles?.length) {
      setDriverVehicle(user.driverInfo.vehicles[0].type);
    }
  }, [user.info, user.driverInfo]);

  const onPhoneNumberChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9\s-]/g, "");
    const formattedValue = value.replace(/-{2,}/g, "-");

    setPhoneNumber(formattedValue);
  };

  const onDriverInsuranceChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (
      files &&
      files.length > 0 &&
      ["image/png", "image/jpeg", "image/jpg"].includes(files[0].type)
    ) {
      setDriverInsurance(files[0]);
    } else {
      console.warn(
        "invalid format detected, the platform may not work as expected.",
      );
    }
  };

  const [isSmsCtaAccepted, setIsSmsCtaAccepted] = useState(false);
  const [authenticateConsents, setAuthenticateConsents] = useState({
    isBackgroundDisclosureAccepted: false,
    GLBPurposeAndDPPAPurpose: false,
    FCRAPurpose: false,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAuthenticateConsents((prevConsents) => ({
      ...prevConsents,
      [name]: checked,
    }));
  };

  const serverRequest = useServerRequest();
  const [error, setError] = useState<null | string>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || !firstName || !lastName) {
      setError("Missing required fields");
      return;
    }
    if (!driverInsurance) {
      setError("Missing required certificates");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const driverInsurancePath = await uploadCertificate(
        user.info.uid,
        driverInsurance!,
        "driver-insurance",
      );

      const dataToUpdate: Partial<DriverEntity> = {
        displayName: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        birthDate: (birthDate && Timestamp.fromDate(birthDate)) || null,
        phoneNumber: phoneNumber,
        isPhoneNumberVerified: false,
      };
      const driverInfo: DriverEntity = {
        ...user.info,
        driverLicenseVerificationStatus: "pending",
        driverLicenseVerificationIssues: [],
        driverLicenseFrontStoragePath: null,
        driverLicenseBackStoragePath: null,
        driverInsuranceVerificationStatus: "pending",
        driverInsuranceVerificationIssues: [],
        driverInsuranceStoragePath: driverInsurancePath,
        isSmsCtaAccepted,
        consents: authenticateConsents,
        vehicles: [
          {
            type: driverVehicle!,
          },
        ],
        verificationStatus: "pending",
        currentEarnings: 0,
        totalEarnings: 0,
        tasksCompleted: 0,
        verificationMessage: null,
        stripeConnectAccountId: null,
        activeTasks: 0,
        payoutMethods: [],
        withdrawalHistory: [],
        ...dataToUpdate,
      };

      delete driverInfo.authenticateAccessCode;

      await Promise.all([
        insertUser(user.info.uid, dataToUpdate),
        updateDriver(user.info.uid, driverInfo),
      ]);

      dispatch(
        setUser({
          ...user,
          driverInfo: driverInfo,
        }),
      );

      const res = await serverRequest(
        "/authenticate/process-identity-verification",
        {
          method: "POST",
          body: {
            user: {
              email: user.info.email!,
              firstName: firstName,
              lastName: lastName,
              dob: birthDate.toISOString(),
              ...(!!phoneNumber && { phoneNumber }),
            },
            consents: authenticateConsents,
            medallion: {
              redirectURL: PUBLIC_WEBAPP_URL?.startsWith("https")
                ? PUBLIC_WEBAPP_URL
                : "https://freedmen-s-trucking.web.app",
            },
          } satisfies ApiReqProcessIdentityVerificationWithAuthenticate,
          schema: apiResProcessIdentityVerificationWithAuthenticate,
        },
      );

      console.log({ res });
      location.href = res.processVerificationUrl;

      setError(null);
      onAdditionalInfoAdded();
    } catch (error: unknown) {
      const err = error as Record<string, unknown> | null | undefined;
      if (err instanceof FirebaseError) {
        const firebaseAuthErrorMessage = getFirebaseErrorMessage(err);
        if (firebaseAuthErrorMessage) {
          setError(firebaseAuthErrorMessage);
          return;
        }
      }
      console.error({ err });
      setError(
        `Unknown Error Occurred! Please try again later. If the problem persist, contact the support.`,
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-md space-y-4 text-secondary-800">
      <h1 className="text-3xl font-bold">Additional Info</h1>
      <form className="flex flex-col gap-1" onSubmit={handleSubmit}>
        <div className="flex flex-row space-x-2">
          <label className="inline-block">
            <span className="block text-sm font-medium text-secondary-800">
              Firs Name<span className="text-lg text-red-400">*</span>
            </span>
            <TextInput
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value.trimStart())}
              required
              min={2}
              autoComplete="given-name"
            />
          </label>
          <label className="inline-block">
            <span className="block text-sm font-medium text-secondary-800">
              Last Name<span className="text-lg text-red-400">*</span>
            </span>
            <TextInput
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value.trimStart())}
              required
              autoComplete="family-name"
              // className="mt-1 block w-full rounded-md border-gray-300 py-4 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>
        <label className="block">
          <span className="block text-sm font-medium text-secondary-800">
            Birth Date<span className="text-lg text-red-400">*</span>
          </span>
          <TextInput
            type="date"
            value={birthDate?.toISOString().split("T")[0] || ""}
            onChange={(e) => setBirthDate(new Date(e.target.value))}
            max={subYears(new Date(), 18).toISOString().split("T")[0]}
            required
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-secondary-800">
            Phone Number:
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
          Vehicle Type
          <span className="text-lg text-red-400">*</span>
        </span>
        <Dropdown
          label=""
          className="mt-[-12px!important] rounded-b-lg rounded-t-none bg-primary-50 shadow-md shadow-primary-700"
          trigger="click"
          renderTrigger={() => (
            <TextInput
              spellCheck
              required
              onChange={() => null}
              onFocus={(e) => e.target.blur()}
              value={driverVehicle || ""}
              id="driver-vehicle-type"
              className={`block w-full cursor-pointer border p-3 text-center text-lg text-black focus:border-red-400 focus:outline-none focus:ring-transparent`}
              placeholder="Vehicle Type >"
            />
          )}
        >
          {Object.entries(vehicleTypes).map(([key, value]) => (
            <Dropdown.Item
              key={key}
              onClick={() => setDriverVehicle(key as VehicleType)}
              className="hover:bg-primary-100"
            >
              <value.Icon />
              <span className="ml-2">{value.title}</span>
            </Dropdown.Item>
          ))}
        </Dropdown>
        {/* <span className="block text-sm font-medium text-secondary-800">
          Driver License ID Front
          <span className="text-lg text-red-400">*</span>
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-8">
          {driverLicenseIdFront && (
            <div className="relative">
              <img
                src={URL.createObjectURL(driverLicenseIdFront)}
                alt="Driver License"
                className="h-20 w-20 object-cover"
              />
              <button
                type="button"
                className="absolute right-0 top-0 overflow-hidden rounded-full bg-red-500 p-1 text-white"
                onClick={() => setDriverLicenseIdFront(null)}
              >
                <IoClose />
              </button>
            </div>
          )}
          {driverLicenseIdFront === null && (
            <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-500">
              <MdOutlinePostAdd className="text-2xl" />
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                multiple={false}
                required
                ref={driverLicenseIdFrontInputRef}
                onChange={onDriverLicenseIDFrontChanged}
                className="absolute left-0 top-0 z-[-1] h-8 w-8 opacity-0"
              />
            </label>
          )}
        </div>
        <span className="block text-sm font-medium text-secondary-800">
          Driver License ID Back
          <span className="text-lg text-red-400">*</span>
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-8">
          {driverLicenseIdBack && (
            <div className="relative">
              <img
                src={URL.createObjectURL(driverLicenseIdBack)}
                alt="Driver License"
                className="h-20 w-20 object-cover"
              />
              <button
                type="button"
                className="absolute right-0 top-0 overflow-hidden rounded-full bg-red-500 p-1 text-white"
                onClick={() => setDriverLicenseIdBack(null)}
              >
                <IoClose />
              </button>
            </div>
          )}
          {driverLicenseIdBack === null && (
            <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-500">
              <MdOutlinePostAdd className="text-2xl" />
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                multiple={false}
                required
                ref={driverLicenseIdBackInputRef}
                onChange={onDriverLicenseIDBackChanged}
                className="absolute left-0 top-0 z-[-1] h-8 w-8 opacity-0"
              />
            </label>
          )}
        </div> */}
        <span className="block text-sm font-medium text-secondary-800">
          Insurance and Registration
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
        <label className="mt-4 inline-flex items-center gap-2 text-sm">
          <Checkbox
            name="isBackgroundDisclosureAccepted"
            checked={authenticateConsents.isBackgroundDisclosureAccepted}
            className="border-primary-100 checked:bg-secondary-800"
            onChange={handleChange}
            required
          />
          I consent to the&nbsp;
          <Tooltip content="By consenting to a background check, you authorize us to obtain information about your criminal history, employment history, education, and other records to assess your suitability for the position. This process ensures a safe and trustworthy environment for all stakeholders.">
            <u>Background Check</u>.
          </Tooltip>
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <Checkbox
            name="GLBPurposeAndDPPAPurpose"
            checked={authenticateConsents.GLBPurposeAndDPPAPurpose}
            onChange={handleChange}
            className="checked:bg-secondary-800"
            required
          />
          I consent to the&nbsp;
          <Tooltip content="The Gramm-Leach-Bliley Act requires financial institutions to explain their information-sharing practices to their customers and to safeguard sensitive data. Your consent allows us to collect, use, and share your personal information as permitted by law to provide you with our services.">
            <u>GLBA</u>
          </Tooltip>
          &nbsp;and&nbsp;
          <Tooltip content="The Driver's Privacy Protection Act regulates the disclosure of personal information gathered by state Departments of Motor Vehicles. By providing your consent, you allow us to access your motor vehicle records as necessary for verifying your driving history and qualifications.">
            <u>DPPA</u>
          </Tooltip>
          .
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <Checkbox
            name="FCRAPurpose"
            checked={authenticateConsents.FCRAPurpose}
            className="checked:bg-secondary-800"
            onChange={handleChange}
            required
          />
          I consent to the&nbsp;
          <Tooltip content="By consenting to the FCRA, you acknowledge that you have read and understand the Fair Credit Reporting Act. The Fair Credit Reporting Act promotes the accuracy, fairness, and privacy of information in the files of consumer reporting agencies. Your consent permits us to obtain consumer reports about you, which may include credit information, for employment purposes.">
            <u>FCRA</u>
          </Tooltip>
          .
        </label>
        <label className="mt-4 inline-flex items-start gap-2 text-sm">
          <Checkbox
            name="isSmsCtaAccepted"
            checked={isSmsCtaAccepted}
            className="mt-1 border-primary-100 checked:bg-secondary-800"
            onChange={(e) => setIsSmsCtaAccepted(e.target.checked)}
            required
          />
          By submitting your phone number, you agree to receive recurring
          delivery updates, onboarding alerts, and payout notifications via SMS
          from Freedmen's Trucking. Message frequency varies. Msg & data rates
          may apply. Reply STOP to unsubscribe.
        </label>
        {error && <p className="py-2 text-xs text-red-500">{error}</p>}
        <PrimaryButton
          type="submit"
          isLoading={isLoading}
          className="mt-4 flex flex-row items-center justify-center gap-2 rounded-md bg-primary-900 px-10 py-2 text-white disabled:cursor-not-allowed disabled:bg-secondary-800"
        >
          {isLoading && <Spinner aria-label="Spinner" size="sm" />}
          <span>Save{isLoading ? "..." : ""}</span>
        </PrimaryButton>
      </form>
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

export const SignUp: React.FC<{ account?: AccountType }> = ({ account }) => {
  const steps = ["Account Type", "User Info", "Additional Info", "Confirm"];
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<number>();
  const [accountType, setAccountType] = useState<AccountType | undefined>(
    account,
  );

  const onAdditionalInfoFilled = () => {
    console.log("onAdditionalInfoFilled");
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
    console.log({ accountType, user });
    if (accountType === "driver" && !user.isAnonymous) {
      setActiveStep((prev) => {
        if (prev && prev < 2) {
          return 2;
        }
        return prev || 2;
      });
    } else if (!user.isAnonymous) {
      setActiveStep(3);
    } else if (accountType) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  }, [accountType, user]);

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
        <AdditionalInfo onAdditionalInfoAdded={onAdditionalInfoFilled} />
      )}
      {activeStep === 3 && accountType && <Confirm accountType={accountType} />}
    </div>
  );
};
