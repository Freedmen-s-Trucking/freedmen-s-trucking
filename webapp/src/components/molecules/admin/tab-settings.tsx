import { Table, Button, Modal, Spinner, Tooltip } from "flowbite-react";
import { HiOutlineTrash } from "react-icons/hi";
import { useDbOperations } from "~/hooks/use-firestore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  LATEST_PLATFORM_SETTINGS_PATH,
  DEFAULT_PLATFORM_SETTINGS,
  PriceRange,
  PlatformSettingsEntity,
} from "@freedmen-s-trucking/types";
import { SecondaryButton, TextInput } from "~/components/atoms";
import { AddressSearchInput } from "~/components/atoms";
import { PiPlus } from "react-icons/pi";
import { CheckIcon } from "lucide-react";
import { customDateFormat } from "~/utils/functions";
import { FaTrash } from "react-icons/fa";

const tableTheme = {
  root: {
    base: "w-full text-left text-sm text-gray-500 dark:text-gray-400",
    shadow:
      "absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white drop-shadow-md dark:bg-black",
    wrapper: "relative",
  },
  body: {
    base: "group/body",
    cell: {
      base: "px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg",
    },
  },
  head: {
    base: "group/head text-xs uppercase text-gray-700 dark:text-gray-400",
    cell: {
      base: "bg-gray-50 px-6 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-gray-700",
    },
  },
  row: {
    base: "group/row",
    hovered: "hover:bg-gray-50 dark:hover:bg-gray-600",
    striped:
      "odd:bg-white even:bg-gray-50 odd:dark:bg-gray-800 even:dark:bg-gray-700",
  },
} as const;

const RemoveCityBtn: React.FC<{
  cities: Exclude<PlatformSettingsEntity["availableCities"], null>;
  removeAt: number;
}> = ({ cities, removeAt }) => {
  const { updatePlatformSettings } = useDbOperations();

  const queryClient = useQueryClient();
  const [canDeleteCity, setCanDeleteCity] = useState<boolean>(false);

  const { mutate: removeCity, isPending: isRemoveCityPending } = useMutation({
    mutationFn: async () => {
      if (!canDeleteCity) return;
      cities.splice(removeAt, 1);
      return updatePlatformSettings({ availableCities: cities });
    },
    onSuccess() {
      console.log("city deleted", removeAt);
      setCanDeleteCity(false);
      queryClient.invalidateQueries({
        queryKey: [LATEST_PLATFORM_SETTINGS_PATH],
      });
    },
    onError(err) {
      console.error("Failed to remove city", err);
    },
  });

  return (
    <>
      <Button color="primary" size="sm" onClick={() => setCanDeleteCity(true)}>
        <HiOutlineTrash color="red" className="h-4 w-4" />
      </Button>
      {canDeleteCity && (
        <Modal
          size="sm"
          // className=" bg-black bg-opacity-70 [&>div>div]:bg-primary-50 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
          show={!!canDeleteCity}
          onClose={() => setCanDeleteCity(false)}
        >
          <Modal.Header className="[&>button]:rounded-full [&>button]:bg-accent-400 [&>button]:p-[1px] [&>button]:text-primary-100 [&>button]:transition-all  [&>button]:duration-300  hover:[&>button]:scale-110 hover:[&>button]:text-primary-950 ">
            <span className="text-lg font-medium">Delete City</span>
          </Modal.Header>
          <Modal.Body className="text-secondary-950">
            <p className="mb-4">
              Are you sure you want to remove the support of this city from the
              platform?
            </p>
            <hr />
            <p className="mb-4 text-xs">{cities[removeAt]?.address}</p>
            <SecondaryButton
              onClick={() => removeCity()}
              isLoading={isRemoveCityPending}
              className="self-end border-teal-500 bg-teal-200 py-2 text-secondary-950"
            >
              Confirm
            </SecondaryButton>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};
const AddCityBtn: React.FC<{
  cities: Exclude<PlatformSettingsEntity["availableCities"], null>;
}> = ({ cities }) => {
  const { updatePlatformSettings } = useDbOperations();

  const queryClient = useQueryClient();
  const [canAddCity, setCanAddCity] = useState<boolean>(false);
  const [currentCity, setCurrentCity] = useState<(typeof cities)[0] | null>(
    null,
  );
  const [cityPrices, setCityPrices] = useState<PriceRange[]>([
    {
      minMiles: 0,
      maxMiles: null,
      customerFees: 2,
      driverFees: 2,
    },
  ]);

  const { mutate: addCity, isPending: isAddCityPending } = useMutation({
    mutationFn: async () => {
      if (!currentCity) return;
      return updatePlatformSettings({
        availableCities: [...cities, { ...currentCity, priceMap: cityPrices }],
      });
    },
    onSuccess() {
      setCurrentCity(null);
      setCanAddCity(false);
      queryClient.invalidateQueries({
        queryKey: [LATEST_PLATFORM_SETTINGS_PATH],
      });
    },
    onError(error) {
      console.error("Failed to add city", error);
    },
  });

  return (
    <>
      <Tooltip
        content={"Add new available city"}
        className="w-40 bg-secondary-800"
      >
        <Button
          color="primary"
          size="sm"
          onClick={() => setCanAddCity(true)}
          className="inline-flex items-center rounded-3xl border border-gray-300 bg-white p-2 text-sm font-medium text-secondary-950 hover:border-teal-800 hover:text-teal-800 focus:border-teal-800 focus:text-teal-800 disabled:pointer-events-none disabled:opacity-50"
        >
          <PiPlus className="h-4 w-4" />
        </Button>
      </Tooltip>
      {canAddCity && (
        <Modal
          size="sm"
          // className=" bg-black bg-opacity-70 [&>div>div]:bg-primary-50 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
          show={!!canAddCity}
          onClose={() => {
            setCanAddCity(false);
            setCurrentCity(null);
          }}
        >
          <Modal.Header className="[&>button]:rounded-full [&>button]:bg-accent-400 [&>button]:p-[1px] [&>button]:text-primary-100 [&>button]:transition-all  [&>button]:duration-300  hover:[&>button]:scale-110 hover:[&>button]:text-primary-950 ">
            <span className="text-lg font-medium">Add City</span>
          </Modal.Header>
          <Modal.Body>
            <form
              onSubmit={() => addCity()}
              className="flex min-h-72 flex-col justify-between gap-4 text-secondary-950"
            >
              <div className="mb-4 flex flex-col gap-2">
                <AddressSearchInput
                  primaryTypes={[
                    "administrative_area_level_1",
                    "administrative_area_level_2",
                  ]}
                  placeholder="Enter city name"
                  onAddressChanged={(params) =>
                    setCurrentCity(
                      !params.place
                        ? null
                        : { ...params.place, priceMap: cityPrices },
                    )
                  }
                />
                {currentCity && (
                  <div className="-mt-2 mb-4 overflow-hidden text-xs font-medium">
                    <p>
                      bounds [{currentCity.viewPort.low.latitude},
                      {currentCity.viewPort.low.longitude}]
                    </p>
                    <p>
                      [{currentCity.viewPort.high.latitude},
                      {currentCity.viewPort.high.longitude}]
                    </p>
                    <p>
                      center: [{currentCity.latitude}, {currentCity.longitude}]
                    </p>
                    <p>Address: {currentCity.address}</p>
                  </div>
                )}
                <span className="-mb-1 mt-2 text-sm font-medium">
                  Prices Map:
                </span>
                {cityPrices.map((price, index) => (
                  <div
                    key={index}
                    className="relative flex flex-row items-stretch gap-2 text-xs"
                  >
                    <label className="flex flex-col text-center font-medium">
                      <span className="flex flex-1 items-center justify-center">
                        Min miles
                      </span>
                      <TextInput
                        type="number"
                        required
                        step={0.01}
                        // readOnly={index + 1 < cityPrices.length}
                        className="min-w-16"
                        min={cityPrices[index - 1]?.maxMiles ?? 0}
                        max={
                          index <= 0
                            ? 0
                            : Math.min(
                                cityPrices[index + 1]?.minMiles ?? Infinity,
                                cityPrices[index]?.maxMiles || Infinity,
                              )
                        }
                        value={price.minMiles ?? ""}
                        onChange={(e) => {
                          const val = e.target.value
                            ? Number(e.target.value)
                            : null;
                          if (val !== null && isNaN(val)) return;
                          setCityPrices((prev) => {
                            const newPrices = [...prev];
                            newPrices[index] = {
                              ...price,
                              minMiles: val,
                            };
                            return newPrices;
                          });
                        }}
                        placeholder="Min"
                      />
                    </label>
                    <label className="flex flex-col text-center font-medium">
                      <span className="flex flex-1 items-center justify-center">
                        Max miles
                      </span>
                      <TextInput
                        type="number"
                        min={0}
                        className="min-w-16"
                        required
                        step={0.01}
                        // readOnly={index + 1 < cityPrices.length}
                        value={price.maxMiles ?? ""}
                        onChange={(e) => {
                          const val = e.target.value
                            ? Number(e.target.value)
                            : null;
                          if (val !== null && isNaN(val)) return;
                          setCityPrices((prev) => {
                            const newPrices = [...prev];
                            newPrices[index] = {
                              ...price,
                              maxMiles: val,
                            };
                            return newPrices;
                          });
                        }}
                        placeholder="Max"
                      />
                    </label>
                    <label className="flex flex-col text-center font-medium">
                      <span className="flex flex-1 items-center justify-center">
                        Customer Fees
                      </span>
                      <TextInput
                        type="number"
                        min={cityPrices[index - 1]?.customerFees ?? 0.1}
                        required
                        step={0.01}
                        className="min-w-16"
                        value={price.customerFees || ""}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (isNaN(val)) return;
                          setCityPrices((prev) => {
                            const newPrices = [...prev];
                            newPrices[index] = {
                              ...price,
                              customerFees: val,
                            };
                            return newPrices;
                          });
                        }}
                        placeholder="CFees"
                      />
                    </label>
                    <label className="flex flex-col text-center font-medium">
                      <span className="flex flex-1 items-center justify-center">
                        Driver Fees
                      </span>
                      <TextInput
                        type="number"
                        min={cityPrices[index - 1]?.driverFees ?? 0.1}
                        max={cityPrices[index]?.customerFees ?? 0.1}
                        required
                        step={0.01}
                        className="min-w-16"
                        value={price.driverFees || ""}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (isNaN(val)) return;
                          setCityPrices((prev) => {
                            const newPrices = [...prev];
                            newPrices[index] = {
                              ...price,
                              driverFees: val,
                            };
                            return newPrices;
                          });
                        }}
                        placeholder="DFees"
                      />
                    </label>
                    {index > 0 && (
                      <div className="absolute -bottom-1 -right-5">
                        <button
                          className={`m-0 inline-block h-11 bg-transparent p-0 transition-all duration-100 `}
                          onClick={() => {
                            setCityPrices((prev) => {
                              const newPrices = [...prev];
                              newPrices.splice(index, 1);
                              return newPrices;
                            });
                          }}
                        >
                          <FaTrash className="rounded-xl p-1 text-xl text-orange-500 hover:bg-gray-200 hover:text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="text-xs font-medium opacity-70">
                  Note:
                  <ul className="ml-4 list-disc">
                    <li>The first min miles will always be zero (0).</li>
                    <li>
                      Zero (0) in max miles means any value greater or equal to
                      min miles will fit.
                    </li>
                  </ul>
                </div>
                <SecondaryButton
                  className={`self-center rounded-xl border bg-transparent px-2 py-1 text-sm text-secondary-900 transition-all  duration-100 hover:text-secondary-900`}
                  disabled={!cityPrices[cityPrices.length - 1]?.maxMiles}
                  onClick={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget.closest("form");
                    if (form?.checkValidity()) {
                      setCityPrices((prev) => [
                        ...prev,
                        {
                          minMiles: prev[prev.length - 1]?.maxMiles ?? null,
                          maxMiles: null,
                          customerFees: 0,
                          driverFees: 0,
                        },
                      ]);
                    } else {
                      form?.reportValidity();
                      console.log("Form is invalid!");
                    }
                  }}
                >
                  + Add Price Range
                </SecondaryButton>
              </div>
              <SecondaryButton
                type="submit"
                disabled={!currentCity}
                isLoading={isAddCityPending}
                className="border-secondary-500 py-2 text-secondary-950"
              >
                Save City
              </SecondaryButton>
            </form>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

const UpdateSettingField: React.FC<{
  type: "text" | "number";
  defaultValue: unknown;
  fieldPath: string;
  label: string;
  updateSetting: (currentValue: string) => Promise<void>;
}> = ({
  type,
  defaultValue,
  fieldPath,
  label,
  updateSetting: _updateSetting,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(`${defaultValue}`);

  const queryClient = useQueryClient();
  const {
    mutate: updateSetting,
    isPending: isUpdateSettingPending,
    error: updateSettingError,
  } = useMutation({
    mutationFn: async (currentValue: string) => {
      if (!currentValue) return;
      if (currentValue === `${defaultValue}`) return;
      await _updateSetting(currentValue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LATEST_PLATFORM_SETTINGS_PATH],
      });
      inputRef.current?.blur();
    },
    onError: (error) => {
      console.error("Failed to update setting", error);
    },
  });

  return (
    <div className="inline-block w-full min-w-80 flex-1">
      <label className="flex w-full min-w-fit max-w-md flex-row items-center justify-between text-sm font-medium text-secondary-800">
        <span className="text-[.8125rem]">{label} :</span>
        <TextInput
          type={type}
          ref={inputRef}
          name={fieldPath}
          aria-invalid={!!updateSettingError}
          aria-errormessage={updateSettingError?.message}
          endIcon={
            <SecondaryButton
              className="mx-0 my-0 inline border-none bg-transparent px-0 py-0"
              isLoading={isUpdateSettingPending}
              onClick={() => updateSetting(value)}
            >
              <CheckIcon className="mr-1 h-5 w-5 rounded-full border-2 border-green-900 bg-primary-50 p-[.12em] text-green-900" />
            </SecondaryButton>
          }
          endIconShowCondition="onFocus"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onEnter={(e) => {
            e.preventDefault();
            const inputValue = e.currentTarget.value;
            console.log(inputValue);
            if (!inputValue) return;
            updateSetting(inputValue);
          }}
          className="mx-2 inline w-[6em!important] rounded-lg border border-secondary-500 px-2 py-1 text-center text-secondary-900 focus:outline-none focus:ring-1 focus:ring-secondary-500"
        />
      </label>
    </div>
  );
};

const PlatformSettings = () => {
  const { fetchPlatformSettings, updatePlatformSettings } = useDbOperations();

  const { data: settings, isLoading } = useQuery({
    queryKey: [LATEST_PLATFORM_SETTINGS_PATH],
    queryFn: fetchPlatformSettings,
    throwOnError(err) {
      console.error("Failed to fetch platform settings", err);
      return false;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="xl" color="purple" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p>No settings found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <h2 className="text-2xl font-bold text-primary-900">Settings</h2>
        {settings.data?.updatedAt && (
          <span className="text-xs text-gray-500">
            Updated At: {customDateFormat(settings.data?.updatedAt)}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 overflow-x-auto rounded-lg">
        <div className="flex w-full items-center justify-between">
          <h3 className="text-lg font-bold text-primary-900">
            Available Cities
          </h3>
          <AddCityBtn cities={settings.data?.availableCities ?? []} />
        </div>
        <div className="w-full overflow-x-auto">
          {(settings.data?.availableCities?.length ?? 0) > 0 && (
            <Table theme={tableTheme} striped>
              <Table.Head>
                <Table.HeadCell>Actions</Table.HeadCell>
                <Table.HeadCell>City</Table.HeadCell>
                <Table.HeadCell>Prices</Table.HeadCell>
                <Table.HeadCell>Center</Table.HeadCell>
                <Table.HeadCell>Bounds</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {settings.data.availableCities?.map((city, index, cities) => (
                  <Table.Row key={index} className="text-xs">
                    <Table.Cell>
                      <RemoveCityBtn cities={cities} removeAt={index} />
                    </Table.Cell>
                    <Table.Cell>{city.address}</Table.Cell>
                    <Table.Cell className="min-w-36">
                      {city.priceMap?.map((v, idx) => (
                        <span
                          key={idx}
                          className="inline-block h-2 text-[.7rem] font-medium"
                        >
                          {v.minMiles}:{v.maxMiles || "∞"} | ${v.customerFees};
                          ${v.driverFees}
                        </span>
                      )) || <div className="font-medium">N/A</div>}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="font-medium">
                        lat:{city.latitude}; lng:{city.longitude}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="m-0">
                        lat:{city.viewPort.low.latitude}; lng:
                        {city.viewPort.low.longitude}
                      </div>
                      <div className="mt-1 text-xs">
                        lat:{city.viewPort.high.latitude}; lng:
                        {city.viewPort.high.longitude}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
        {!settings.data.availableCities?.length && <p>No cities found</p>}
      </div>
      <div className="flex flex-col items-center gap-4 overflow-x-auto rounded-lg">
        <div className="flex w-full items-center justify-between">
          <h3 className="text-lg font-bold text-primary-900">
            Task Assignment Config
          </h3>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-wrap content-stretch gap-2">
            <UpdateSettingField
              type="number"
              defaultValue={
                settings.data.taskAssignmentConfig
                  ?.pickupsGroupDistanceInMeters ??
                DEFAULT_PLATFORM_SETTINGS.taskAssignmentConfig
                  .pickupsGroupDistanceInMeters
              }
              fieldPath="taskAssignmentConfig.pickupsGroupDistanceInMeters"
              label="Pickups Group Distance (meters)"
              updateSetting={(currentValue) =>
                updatePlatformSettings({
                  taskAssignmentConfig: {
                    ...DEFAULT_PLATFORM_SETTINGS.taskAssignmentConfig,
                    ...(settings.data.taskAssignmentConfig || {}),
                    pickupsGroupDistanceInMeters: Number(currentValue),
                  },
                })
              }
            />
            <UpdateSettingField
              type="number"
              defaultValue={
                settings.data.taskAssignmentConfig
                  ?.dropoffsGroupsDistanceInMeters ??
                DEFAULT_PLATFORM_SETTINGS.taskAssignmentConfig
                  .dropoffsGroupsDistanceInMeters
              }
              fieldPath="taskAssignmentConfig.dropoffsGroupsDistanceInMeters"
              label="Dropoffs Group Distance (meters)"
              updateSetting={(currentValue) =>
                updatePlatformSettings({
                  taskAssignmentConfig: {
                    ...DEFAULT_PLATFORM_SETTINGS.taskAssignmentConfig,
                    ...(settings.data.taskAssignmentConfig || {}),
                    dropoffsGroupsDistanceInMeters: Number(currentValue),
                  },
                })
              }
            />
            <UpdateSettingField
              type="number"
              defaultValue={
                settings.data.taskAssignmentConfig?.maxDriverRadiusInMeters ??
                DEFAULT_PLATFORM_SETTINGS.taskAssignmentConfig
                  .maxDriverRadiusInMeters
              }
              fieldPath="taskAssignmentConfig.maxDriverRadiusInMeters"
              label="Max Driver Radius (meters)"
              updateSetting={(currentValue) =>
                updatePlatformSettings({
                  taskAssignmentConfig: {
                    ...DEFAULT_PLATFORM_SETTINGS.taskAssignmentConfig,
                    ...(settings.data.taskAssignmentConfig || {}),
                    maxDriverRadiusInMeters: Number(currentValue),
                  },
                })
              }
            />

            <UpdateSettingField
              type="number"
              defaultValue={
                settings.data.taskAssignmentConfig?.maxOrdersPerGroup ??
                DEFAULT_PLATFORM_SETTINGS.taskAssignmentConfig.maxOrdersPerGroup
              }
              fieldPath="taskAssignmentConfig.maxOrdersPerGroup"
              label="Max Orders per Group"
              updateSetting={(currentValue) =>
                updatePlatformSettings({
                  taskAssignmentConfig: {
                    ...DEFAULT_PLATFORM_SETTINGS.taskAssignmentConfig,
                    ...(settings.data.taskAssignmentConfig || {}),
                    maxOrdersPerGroup: Number(currentValue),
                  },
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
