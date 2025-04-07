import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Dropdown,
  Tooltip,
} from "flowbite-react";
import { Card } from "flowbite-react/components/Card";
import { MdHideImage } from "react-icons/md";
import { AppImage } from "~/components/atoms/image";
import { useAuth } from "~/hooks/use-auth";
import { useDbOperations } from "~/hooks/use-firestore";
import { useStorageOperations } from "~/hooks/use-storage";
import { useAppDispatch } from "~/stores/hooks";
import { setUser, updateDriverInfo } from "~/stores/controllers/auth-ctrl";
import { DriverEntity, VehicleType } from "@freedmen-s-trucking/types";
import { driverVerificationBadges, vehicleTypes } from "~/utils/constants";
import { BodyText, Heading3, TextInput } from "~/components/atoms/base";
import { HiX } from "react-icons/hi";

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

  const { mutate: updateDriver } = useMutation({
    mutationFn: async (driverInfo: Partial<DriverEntity>) => {
      return _updateDriver(user.info.uid, driverInfo);
    },
    onSuccess(_, variables) {
      dispatch(updateDriverInfo(variables));
      queryClient.invalidateQueries({ queryKey: ["driverInfo"] });
    },
  });

  const { data: driverLicenseUrl } = useQuery({
    initialData: "",
    queryKey: ["driverLicenseUrl", driverInfo?.driverLicense?.storagePath],
    queryFn: () => fetchImage(driverInfo?.driverLicense?.storagePath || ""),
    select(data) {
      return data;
    },
    throwOnError(error, query) {
      console.warn({ ref: "driverLicenseUrl", error, query });
      return false;
    },
  });
  const { data: driverInsuranceUrl } = useQuery({
    initialData: "",
    queryKey: ["driverInsuranceUrl", driverInfo?.driverInsurance?.storagePath],
    queryFn: () => fetchImage(driverInfo?.driverInsurance?.storagePath || ""),
    select(data) {
      return data;
    },
    throwOnError(error, query) {
      console.warn({ ref: "driverInsuranceUrl", error, query });
      return false;
    },
  });

  const setDriverVehicle = async (vehicleType: VehicleType) => {
    updateDriver({
      vehicles: [
        {
          type: vehicleType,
        },
      ],
    });
  };

  const handleUploadLicense = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files.length > 0) {
      const res = await uploadCertificate(
        user.info.uid,
        files[0],
        "driver-license",
      );
      if (!res) return;
      await updateDriver({
        driverLicense: {
          storagePath: res,
          status: "pending",
          expiry: "",
          issues: [],
        },
      });
      dispatch(
        setUser({
          ...user,
          driverInfo: {
            ...(user.driverInfo || ({} as DriverEntity)),
            driverLicense: {
              storagePath: res,
              status: "pending",
              expiry: "",
              issues: [],
            },
          },
        }),
      );
    }
  };

  const handleUploadInsurance = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files.length > 0) {
      const res = await uploadCertificate(
        user.info.uid,
        files[0],
        "driver-insurance",
      );
      if (!res) return;
      await updateDriver({
        driverInsurance: {
          storagePath: res,
          status: "pending",
          expiry: "",
          issues: [],
        },
      });
      dispatch(
        setUser({
          ...user,
          driverInfo: {
            ...(user.driverInfo || ({} as DriverEntity)),
            driverInsurance: {
              storagePath: res,
              status: "pending",
              expiry: "",
              issues: [],
            },
          },
        }),
      );
    }
  };

  if (!driverInfo) {
    return null;
  }
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {driverInfo.verificationStatus === "failed" &&
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
      <Card className="lg:col-span-2">
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
          <h5 className="mb-3 text-lg font-bold">Driver License Information</h5>
          <div className="rounded-lg bg-primary-50 p-4">
            <div className="mb-3 flex items-start justify-between">
              <AppImage
                fallback={<MdHideImage className="h-8 w-8" />}
                src={driverLicenseUrl}
                alt="driver license"
                className="h-auto w-1/2 max-w-96 rounded-md"
              />
              {/* <div>
                      <p>
                        <strong>License Number:</strong>{" "}
                        {driverInfo.driverLicense.number}
                      </p>
                      <p>
                        <strong>Expiry Date:</strong>{" "}
                        {driverInfo.driverLicense.expiry}
                      </p>
                    </div> */}
              <div>{getVerificationBadge(driverInfo.driverLicense.status)}</div>
            </div>

            {driverInfo.driverLicense.status === "failed" && (
              <div className="mt-3 border-l-4 border-red-400 bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Verification Issues
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc space-y-1 pl-5">
                        {driverInfo.driverLicense.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-between">
              {driverInfo.driverLicense.status !== "verified" && (
                <>
                  <label className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-500">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      multiple={false}
                      required
                      onChange={handleUploadLicense}
                      className="absolute left-0 top-0 z-[-1] h-8 w-8 opacity-0"
                    />
                    <Button color="light" className="pointer-events-none">
                      Upload New License
                    </Button>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h5 className="mb-3 text-lg font-bold">Insurance Information</h5>
          <div className="rounded-lg bg-primary-50 p-4">
            <div className="mb-3 flex items-start justify-between">
              <AppImage
                fallback={<MdHideImage className="h-8 w-8" />}
                src={driverInsuranceUrl}
                alt="driver license"
                className="h-auto w-1/2 max-w-96 rounded-md"
              />
              <div>
                {getVerificationBadge(driverInfo.driverInsurance.status)}
              </div>
            </div>

            {driverInfo.driverInsurance.status === "failed" && (
              <div className="mt-3 border-l-4 border-red-400 bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Verification Issues
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc space-y-1 pl-5">
                        {driverInfo.driverInsurance.issues.map(
                          (issue, index) => (
                            <li key={index}>{issue}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-between">
              {driverInfo.driverInsurance.status !== "verified" && (
                <label className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-500">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    multiple={false}
                    required
                    onChange={handleUploadInsurance}
                    className="absolute left-0 top-0 z-[-1] h-8 w-8 opacity-0"
                  />
                  <Button color="light" className="pointer-events-none">
                    Upload New Insurance
                  </Button>
                </label>
              )}
            </div>
          </div>
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
          <h5 className="mb-4 text-xl font-bold">Payment Methods</h5>
          {driverInfo.paymentMethods.map((method) => (
            <div
              key={method.id}
              className="mb-3 flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{method.type}</p>
                <p className="text-sm text-gray-600">{method.details}</p>
              </div>
              <div className="flex items-center">
                {method.default && (
                  <Badge color="success" className="mr-2">
                    Default
                  </Badge>
                )}
                <Button size="xs" color="light">
                  Edit
                </Button>
              </div>
            </div>
          ))}
          <Button disabled color="dark">
            Add Payment Method
          </Button>
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
                {driverInfo.withdrawalHistory.length === 0 && (
                  <li className="py-3">
                    <p className="text-xs font-medium">No withdrawals yet</p>
                  </li>
                )}
                {driverInfo.withdrawalHistory.map((withdrawal) => (
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
