import {
  ApiResSetupConnectedAccount,
  DriverEntity,
  type,
  VehicleType,
} from "@freedmen-s-trucking/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Dropdown,
  Tooltip,
} from "flowbite-react";
import { Card } from "flowbite-react/components/Card";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CiImageOff } from "react-icons/ci";
import { HiX } from "react-icons/hi";
import { MdRestartAlt } from "react-icons/md";
import { ResponseError } from "up-fetch";
import {
  AppImage,
  BodyText,
  Heading3,
  SecondaryButton,
  TextInput,
} from "~/components/atoms";
import { useAuth } from "~/hooks/use-auth";
import { useDbOperations } from "~/hooks/use-firestore";
import { useServerRequest } from "~/hooks/use-server-request";
import { useStorageOperations } from "~/hooks/use-storage";
import { setUser, updateDriverInfo } from "~/stores/controllers/auth-ctrl";
import { useAppDispatch } from "~/stores/hooks";
import { driverVerificationBadges, vehicleTypes } from "~/utils/constants";
import { PUBLIC_WEBAPP_URL } from "~/utils/envs";
import { fileToBase64, getDriverVerificationStatus } from "~/utils/functions";

const getVerificationBadge = (
  status: keyof typeof driverVerificationBadges,
  iconOnly = false,
) => {
  const badge = driverVerificationBadges[status];

  return (
    <Tooltip
      content={badge.label}
      placement="top"
      // className="w-40 bg-secondary-800"
    >
      <Badge color={badge.color} icon={badge.icon} size="xs">
        {!iconOnly && badge.label}
      </Badge>
    </Tooltip>
  );
};

export const DriverProfile: React.FC = () => {
  const { fetchImage, uploadCertificate } = useStorageOperations();
  const { user } = useAuth();
  const driverInfo = user.driverInfo;
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { updateDriver: _updateDriver } = useDbOperations();
  const driverLicenseIdFrontInputRef = useRef<HTMLInputElement>(null);
  const driverLicenseIdBackInputRef = useRef<HTMLInputElement>(null);
  const driverInsuranceInputRef = useRef<HTMLInputElement>(null);
  const [certificateUploadError, setCertificateUploadError] = useState<
    string | null
  >(null);
  const [driverLicenseIdFront, setDriverLicenseIdFront] = useState<File | null>(
    null,
  );
  const [driverLicenseIdBack, setDriverLicenseIdBack] = useState<File | null>(
    null,
  );
  const [driverInsurance, setDriverInsurance] = useState<File | null>(null);

  const { mutate: updateDriver } = useMutation({
    mutationFn: async (driverInfo: Partial<DriverEntity>) => {
      return _updateDriver(user.info.uid, driverInfo);
    },
    onSuccess(_, variables) {
      dispatch(updateDriverInfo(variables));
      queryClient.invalidateQueries({ queryKey: ["driverInfo"] });
    },
    onError(err) {
      console.error(err);
      return false;
    },
  });

  const { data: driverLicenseFrontUrl } = useQuery({
    initialData: "",
    enabled: !!driverInfo?.driverLicenseFrontStoragePath,
    queryKey: ["driverLicenseUrl", driverInfo?.driverLicenseFrontStoragePath],
    queryFn: () => fetchImage(driverInfo?.driverLicenseFrontStoragePath || ""),
    throwOnError: false,
  });
  const { data: driverLicenseBackUrl } = useQuery({
    initialData: "",
    enabled: !!driverInfo?.driverLicenseBackStoragePath,
    queryKey: ["driverLicenseUrl", driverInfo?.driverLicenseBackStoragePath],
    queryFn: () => fetchImage(driverInfo?.driverLicenseBackStoragePath || ""),
    throwOnError: false,
  });
  const { data: driverInsuranceUrl } = useQuery({
    initialData: "",
    enabled: !!driverInfo?.driverInsuranceStoragePath,
    queryKey: ["driverInsuranceUrl", driverInfo?.driverInsuranceStoragePath],
    queryFn: () => fetchImage(driverInfo?.driverInsuranceStoragePath || ""),
    throwOnError: false,
  });

  const onFileInputChanged = (
    e: React.ChangeEvent<HTMLInputElement>,
    mutate: (f: File) => void,
  ) => {
    const files = e.target.files;
    if (
      files &&
      files.length > 0 &&
      ["image/png", "image/jpeg", "image/jpg"].includes(files[0].type)
    ) {
      mutate(files[0]);
    } else {
      console.warn(
        "invalid format detected, the platform may not work as expected.",
      );
    }
  };

  const serverRequest = useServerRequest();
  // const { mutate: driverLicenseFinalCheck } = useMutation({
  //   mutationKey: [
  //     "driverLicenseFinalCheck",
  //     driverInfo?.authenticateAccessCode,
  //   ],
  //   retry(failureCount, error) {
  //     if (
  //       error instanceof ResponseError &&
  //       error.data?.error?.errorMessage &&
  //       error.data?.error?.errorCode &&
  //       error.status === 400
  //     ) {
  //       const licenseStatus = {
  //         driverLicenseVerificationStatus:
  //           error.data.error.errorCode === "IDENTITY_ALREADY_VERIFIED"
  //             ? "verified"
  //             : "failed",
  //         driverLicenseVerificationIssues:
  //           error.data.error.errorCode === "IDENTITY_ALREADY_VERIFIED"
  //             ? []
  //             : [
  //                 `${error.data.error.errorCode || "Error"}: ${error.data.error.errorMessage}`,
  //               ],
  //       } as Partial<DriverEntity>;

  //       updateDriver(licenseStatus);
  //       dispatch(updateDriverInfo(licenseStatus));
  //       return false;
  //     }

  //     if (failureCount < 3) {
  //       return true;
  //     }
  //     return false;
  //   },
  //   retryDelay: 30_000, // This mus not exceed 30s from the doc: https://tanstack.com/query/latest/docs/framework/react/guides/query-retries#retry-delay
  //   mutationFn: async () => {
  //     const res = await serverRequest("/authenticate/identity/verify", {
  //       method: "GET",
  //       schema: type({
  //         success: "boolean",
  //         IDVScore: {
  //           ssn: "number | null",
  //           name: "number | null",
  //           dob: "number | null",
  //         },
  //       }),
  //     });

  //     const driverStatus = {
  //       driverLicenseVerificationStatus: res.success ? "verified" : "failed",
  //       driverLicenseVerificationIssues: [],
  //     } as Partial<DriverEntity>;

  //     updateDriver(driverStatus);
  //     dispatch(updateDriverInfo(driverStatus));
  //     return res;
  //   },
  //   throwOnError() {
  //     return false;
  //   },
  // });

  // useQuery({
  //   initialData: null,
  //   enabled: driverInfo?.driverLicenseVerificationStatus !== "verified",
  //   queryKey: [
  //     "driverLicenseUploadCheck",
  //     driverInfo?.driverLicenseFrontStoragePath,
  //     driverInfo?.driverLicenseBackStoragePath,
  //   ],
  //   retry(failureCount, error) {
  //     if (error instanceof ResponseError && error.data?.error?.errorMessage) {
  //       const licenseStatus = {
  //         driverLicenseVerificationStatus: "failed",
  //         driverLicenseVerificationIssues: [error.data?.error?.errorMessage],
  //       } as Partial<DriverEntity>;

  //       updateDriver(licenseStatus);
  //       dispatch(updateDriverInfo(licenseStatus));
  //       return false;
  //     }

  //     if (failureCount < 3) {
  //       return true;
  //     }
  //     return false;
  //   },
  //   retryDelay: 30_000, // This mus not exceed 30s from the doc: https://tanstack.com/query/latest/docs/framework/react/guides/query-retries#retry-delay
  //   queryFn: async () => {
  //     const res = await serverRequest(
  //       "/authenticate/identity/document/scan/status",
  //       {
  //         method: "GET",
  //         schema: type({
  //           success: "boolean",
  //           result:
  //             "'complete' | 'parsing_failed' | 'unknown_state' | 'unknown_error' | 'under_review'",
  //           numAttemptsLeft: "number",
  //           description: "string",
  //         }),
  //       },
  //     );

  //     const driverStatus = {
  //       driverLicenseVerificationStatus:
  //         res.result === "parsing_failed" ? "failed" : "pending",
  //       driverLicenseVerificationIssues:
  //         res.result === "parsing_failed"
  //           ? [
  //               "Unable to detect the image. This can be caused by poor-quality photos, bad lighting, glares, or other things that interfere with the image. Please try again and make sure that the ID is on a contrasted surface (i.e., a white ID on a black background or a black ID on a white background)",
  //             ]
  //           : [],
  //     } as Partial<DriverEntity>;
  //     updateDriver(driverStatus);
  //     dispatch(updateDriverInfo(driverStatus));

  //     if (res.result === "complete") {
  //       driverLicenseFinalCheck();
  //     }
  //     return res;
  //   },
  //   throwOnError() {
  //     return false;
  //   },
  // });
  const setDriverVehicle = async (vehicleType: VehicleType) => {
    updateDriver({
      vehicles: [
        {
          type: vehicleType,
        },
      ],
    });
  };

  const {
    mutate: handleUploadLicense,
    isPending: handleUploadLicenseIsPending,
  } = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // WARNING: e.currentTarget is null for unknown reason that is why we use the target instead.
      const fd = new FormData(e.currentTarget || e.target);
      const frontF = fd.get("driverLicenseFront");
      const backF = fd.get("driverLicenseBack");
      console.log({ frontF, backF });
      if (frontF instanceof File && backF instanceof File) {
        const frontNewPath = await uploadCertificate(
          user.info.uid,
          frontF,
          "driver-license-front",
        );
        const backNewPath = await uploadCertificate(
          user.info.uid,
          backF,
          "driver-license-back",
        );
        const { success } = await serverRequest(
          "/authenticate/identity/document/scan",
          {
            method: "POST",
            body: {
              userAccessCode: driverInfo?.authenticateAccessCode,
              idFront: await fileToBase64(frontF),
              idBack: await fileToBase64(backF),
              country: 0, // Country code can be found here: https://docs.authenticate.com/docs/supported-countries-for-upload-id
            },
            schema: type({
              success: "boolean",
            }),
            onError(error) {
              if (error instanceof ResponseError) {
                switch (error.status) {
                  case 413:
                    setCertificateUploadError(
                      "image too large. Reduce the size of the uploaded certificate and try again.",
                    );
                    break;
                  case 400:
                  case 417:
                    setCertificateUploadError(error.data?.errorMessage || null);
                    break;
                }
              }
            },
          },
        );

        if (!success) {
          throw new Error("Failed to scan driver license");
        }
        updateDriver({
          driverLicenseFrontStoragePath: frontNewPath,
          driverLicenseBackStoragePath: backNewPath,
          driverLicenseVerificationStatus: "pending",
          driverLicenseVerificationIssues: [],
        });
        setDriverLicenseIdBack(null);
        setDriverLicenseIdFront(null);
        setCertificateUploadError(null);
        dispatch(
          setUser({
            ...user,
            driverInfo: {
              ...(user.driverInfo || ({} as DriverEntity)),
              driverLicenseFrontStoragePath: frontNewPath,
              driverLicenseBackStoragePath: backNewPath,
              driverLicenseVerificationStatus: "pending",
              driverLicenseVerificationIssues: [],
            },
          }),
        );
        if (driverLicenseIdFrontInputRef.current?.value) {
          driverLicenseIdFrontInputRef.current.value = "";
        }
        if (driverLicenseIdBackInputRef.current?.value) {
          driverLicenseIdBackInputRef.current.value = "";
        }
        queryClient.invalidateQueries({
          queryKey: [
            "driverLicenseUrl",
            driverInfo?.driverLicenseFrontStoragePath,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "driverLicenseUrl",
            driverInfo?.driverLicenseBackStoragePath,
          ],
        });
        queryClient.invalidateQueries({
          queryKey: [
            "driverLicenseUploadCheck",
            driverInfo?.driverLicenseFrontStoragePath,
            driverInfo?.driverLicenseBackStoragePath,
          ],
        });
      }
    },
  });

  const {
    mutate: handleUploadInsurance,
    isPending: handleUploadInsuranceIsPending,
  } = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // WARNING: e.currentTarget is null for unknown reason that is why we use the target instead.
      const fd = new FormData(e.currentTarget || e.target);
      const frontF = fd.get("driverInsurance");
      if (frontF instanceof File) {
        const res = await uploadCertificate(
          user.info.uid,
          frontF,
          "driver-insurance",
        );
        if (!res) return;
        updateDriver({
          driverInsuranceStoragePath: res,
          driverInsuranceVerificationStatus: "pending",
          driverInsuranceVerificationIssues: [],
        });
        dispatch(
          setUser({
            ...user,
            driverInfo: {
              ...(user.driverInfo || ({} as DriverEntity)),
              driverInsuranceStoragePath: res,
              driverInsuranceVerificationStatus: "pending",
              driverInsuranceVerificationIssues: [],
            },
          }),
        );
        if (driverInsuranceInputRef.current) {
          driverInsuranceInputRef.current.value = "";
        }
        setDriverInsurance(null);
        queryClient.invalidateQueries({
          queryKey: [
            "driverInsuranceUrl",
            driverInfo?.driverInsuranceStoragePath,
          ],
        });
      }
    },
  });

  const { mutate: setupDriverPayment, isPending: setupDriverPaymentIsPending } =
    useMutation({
      mutationFn: async () => {
        console.log("Setting up driver payment");

        const response = await serverRequest(
          "/stripe/setup-connected-account",
          {
            method: "POST",
            schema: type({
              response: {
                object: "string",
                created: "number.epoch",
                expires_at: "number.epoch",
                url: "string.url",
              },
            }),
            body: {
              stripeConnectAccountId:
                driverInfo?.stripeConnectAccountId || null,
              returnUrl: `${PUBLIC_WEBAPP_URL}/app/driver/dashboard`,
              refreshUrl: `${PUBLIC_WEBAPP_URL}/app/driver/dashboard#refreshPayment`,
            } satisfies ApiResSetupConnectedAccount,
          },
        );

        return response;
      },
      onError(error) {
        console.log((error as Error).stack);
        console.error(error);
      },
      onSuccess(data) {
        window.location.href = data.response.url;
      },
    });

  const routerState = useRouterState();
  useEffect(() => {
    console.log(routerState.location);
    if (routerState.location.hash === "#refreshPayment") {
      setupDriverPayment();
    }
  }, [routerState, setupDriverPayment]);

  if (!driverInfo) {
    return null;
  }
  return (
    <div className="grid grid-cols-1 gap-6">
      {getDriverVerificationStatus(driverInfo) === "failed" &&
        driverInfo.verificationMessage && (
          <Banner className="bg-red-100">
            <div className="flex w-full flex-col justify-between border-b border-gray-200 p-4 dark:border-gray-600 dark:bg-gray-700 md:flex-row">
              <div className="mb-4 md:mb-0 md:mr-4">
                <Heading3>Verification Failed</Heading3>
                <BodyText>{driverInfo.verificationMessage}</BodyText>
              </div>
              <div className="flex shrink-0 items-center">
                <Banner.CollapseButton
                  color="gray"
                  className="border-0 bg-transparent text-gray-500 dark:text-gray-400"
                >
                  <HiX className="h-4 w-4" />
                </Banner.CollapseButton>
              </div>
            </div>
          </Banner>
        )}
      {/* <Card> className="lg:col-span-2"> */}
      <Card>
        <h5 className="mb-4 text-xl font-bold">Personal Information</h5>
        <div className="mb-6 flex flex-col sm:flex-row">
          <div className="mb-4 sm:mb-0 sm:mr-6">
            <Avatar
              placeholderInitials={user.info.displayName}
              img={user.info.photoURL || ""}
              size="xl"
              rounded
            />
            {/* <Button size="xs" className="mt-2 w-full">
                    Change Photo
                  </Button> */}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-800">
                Full Name
              </label>
              <TextInput
                type="text"
                onFocus={(e) => e.target.blur()}
                className="mt-1 block w-full cursor-default rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={user.info.displayName}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-800">
                Email Address
              </label>
              <TextInput
                type="email"
                onFocus={(e) => e.target.blur()}
                className="mt-1 block w-full cursor-default rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={user.info.email || ""}
                readOnly
              />
            </div>
          </div>
        </div>
        {/* Driver License Information */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-start justify-between">
            <h5 className="mb-3 text-lg font-bold">
              Driver License Information
            </h5>
            <div>
              {getVerificationBadge(
                driverInfo.driverLicenseVerificationStatus || "failed",
              )}
            </div>
          </div>
          <div className="rounded-lg bg-primary-50">
            <form
              onSubmit={handleUploadLicense}
              className="mb-3 flex flex-col items-center"
            >
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-stretch">
                <div className="relative">
                  <AppImage
                    fallback={<CiImageOff className="h-40 w-40" />}
                    src={
                      (driverLicenseIdFront &&
                        URL.createObjectURL(driverLicenseIdFront)) ||
                      driverLicenseFrontUrl
                    }
                    alt="driver license front"
                    className="flex h-auto max-w-[80vw] rounded-md sm:w-full"
                  />
                  {driverInfo.driverLicenseVerificationStatus !==
                    "verified" && (
                    <label className="absolute bottom-2 right-2 ml-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white shadow-md shadow-primary-900">
                      <MdRestartAlt className="text-2xl" />
                      <input
                        type="file"
                        name="driverLicenseFront"
                        accept=".png,.jpg,.jpeg"
                        multiple={false}
                        ref={driverLicenseIdFrontInputRef}
                        required
                        onChange={(e) =>
                          onFileInputChanged(e, setDriverLicenseIdFront)
                        }
                        className="absolute left-0 top-0 z-[-1] h-8 w-8 opacity-0"
                      />
                    </label>
                  )}
                </div>
                <div className="relative">
                  <AppImage
                    fallback={<CiImageOff className="h-40 w-40" />}
                    src={
                      (driverLicenseIdBack &&
                        URL.createObjectURL(driverLicenseIdBack)) ||
                      driverLicenseBackUrl
                    }
                    alt="driver license back"
                    className="h-auto max-w-[80vw] rounded-md sm:w-full"
                  />
                  {driverInfo.driverLicenseVerificationStatus !==
                    "verified" && (
                    <label className="absolute bottom-2 right-2 ml-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white shadow-md shadow-primary-900">
                      <MdRestartAlt className="text-2xl" />
                      <input
                        type="file"
                        name="driverLicenseBack"
                        accept=".png,.jpg,.jpeg"
                        ref={driverLicenseIdBackInputRef}
                        onChange={(e) =>
                          onFileInputChanged(e, setDriverLicenseIdBack)
                        }
                        multiple={false}
                        required
                        className="absolute left-0 top-0 z-[-1] h-8 w-8 opacity-0"
                      />
                    </label>
                  )}
                </div>
              </div>
              {driverInfo.driverLicenseVerificationStatus === "failed" && (
                <div className="mt-3 border-l-4 border-red-400 bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Verification Issues
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc space-y-1 pl-5">
                          {driverInfo.driverLicenseVerificationIssues?.map(
                            (issue, index) => <li key={index}>{issue}</li>,
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {certificateUploadError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-red-500"
                >
                  {certificateUploadError}
                </motion.div>
              )}
              {driverInfo.driverLicenseVerificationStatus !== "verified" && (
                <SecondaryButton
                  type="submit"
                  color="light"
                  className="mt-5 bg-white py-2"
                  isLoading={handleUploadLicenseIsPending}
                >
                  Upload New License
                </SecondaryButton>
              )}
            </form>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-start justify-between">
            <h5 className="mb-3 text-lg font-bold">Insurance Information</h5>
            <div>
              {getVerificationBadge(
                driverInfo.driverInsuranceVerificationStatus || "failed",
              )}
            </div>
          </div>

          <form
            onSubmit={handleUploadInsurance}
            className="flex flex-col items-center rounded-lg bg-primary-50 p-4"
          >
            <div className="relative mb-3 inline-block">
              <AppImage
                fallback={<CiImageOff className="h-40 w-40" />}
                src={
                  (driverInsurance && URL.createObjectURL(driverInsurance)) ||
                  driverInsuranceUrl
                }
                alt="driver insurance"
                className="h-auto max-w-[80vw] rounded-md sm:w-full"
              />
              {driverInfo.driverInsuranceVerificationStatus !== "verified" && (
                <label className="absolute bottom-2 right-2 ml-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white shadow-md shadow-primary-900">
                  <MdRestartAlt className="text-2xl" />
                  <input
                    type="file"
                    name="driverInsurance"
                    accept=".png,.jpg,.jpeg"
                    ref={driverInsuranceInputRef}
                    onChange={(e) => onFileInputChanged(e, setDriverInsurance)}
                    multiple={false}
                    required
                    className="absolute left-0 top-0 z-[-1] h-8 w-8 opacity-0"
                  />
                </label>
              )}
            </div>

            {driverInfo.driverInsuranceVerificationStatus === "failed" && (
              <div className="mt-3 border-l-4 border-red-400 bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Verification Issues
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc space-y-1 pl-5">
                        {driverInfo.driverInsuranceVerificationIssues?.map(
                          (issue, index) => <li key={index}>{issue}</li>,
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-between">
              {driverInfo.driverInsuranceVerificationStatus !== "verified" && (
                <SecondaryButton
                  type="submit"
                  className="mt-5 bg-white py-2"
                  isLoading={handleUploadInsuranceIsPending}
                >
                  Upload New Insurance
                </SecondaryButton>
              )}
            </div>
          </form>
        </div>
      </Card>

      {/* Vehicle list */}
      <Card>
        <span className="block text-sm font-medium text-secondary-800">
          Vehicle Type
        </span>
        <Dropdown
          label=""
          className="mt-[-12px!important] rounded-b-lg rounded-t-none bg-primary-50 shadow-md shadow-primary-700"
          trigger="click"
          renderTrigger={() => (
            <TextInput
              spellCheck
              readOnly
              onFocus={(e) => e.target.blur()}
              value={driverInfo.vehicles?.[0].type || ""}
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
      </Card>

      {/* Payment Methods */}
      <div className="space-y-6">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h5 className="mb-4 text-xl font-bold">Payment Info</h5>
            <span className="mb-4 inline text-sm">
              status:
              <Badge
                color={
                  driverInfo.payoutCapabilities?.transfers === "active"
                    ? "success"
                    : "warning"
                }
                className="mr-2 inline"
              >
                {driverInfo.payoutCapabilities?.transfers || "need_setup"}
              </Badge>
            </span>
          </div>
          {driverInfo.payoutMethods?.map((method) => (
            <div
              key={method.id}
              className="mb-3 flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{method.type}</p>
                <p className="text-sm text-gray-600">{method.name}</p>
              </div>
              <div className="flex items-center">
                {method.status === "verified" ? (
                  <Badge color="success" className="mr-2">
                    Verified
                  </Badge>
                ) : method.status === "validation_failed" ||
                  method.status === "errored" ? (
                  <Badge color="failure" className="mr-2">
                    Failed
                  </Badge>
                ) : (
                  <Badge color="warning" className="mr-2">
                    Pending
                  </Badge>
                )}
                {/* <Button size="xs" color="light">
                  Edit
                </Button> */}
              </div>
            </div>
          ))}
          {driverInfo.payoutCapabilities?.transfers !== "active" && (
            <SecondaryButton
              onClick={() => setupDriverPayment()}
              isLoading={setupDriverPaymentIsPending}
              className="mt-5 self-center bg-white py-2"
            >
              Setup Payment
            </SecondaryButton>
          )}
        </Card>

        {/* Withdrawals */}
        <Card>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h5 className="text-xl font-bold">Withdrawals</h5>
            <Button disabled color="dark" size="xs">
              Request Withdrawal
            </Button>
          </div>
          <div className="space-y-3">
            <p className="font-medium">Available for withdrawal:</p>
            <p className="text-2xl font-bold text-green-900">
              ${driverInfo.currentEarnings?.toFixed(2) || 0}
            </p>
          </div>
          <div className="mt-4">
            <h6 className="mb-2 font-medium">Recent Withdrawals</h6>
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {!driverInfo.withdrawalHistory?.length && (
                  <li className="py-3">
                    <p className="text-xs font-medium">No withdrawals yet</p>
                  </li>
                )}
                {driverInfo.withdrawalHistory?.map((withdrawal) => (
                  <li key={withdrawal.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium">{withdrawal.id}</p>
                        <p className="text-xs text-gray-500">
                          {withdrawal.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          ${withdrawal.amount.toFixed(2)}
                        </p>
                        <Badge color="success" className="mt-1">
                          {withdrawal.status}
                        </Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
