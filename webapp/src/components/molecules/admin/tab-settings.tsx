import { Table, Button, Modal, Spinner, Tooltip } from "flowbite-react";
import { HiOutlineTrash } from "react-icons/hi";
import { useDbOperations } from "~/hooks/use-firestore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  PlaceLocation,
  LATEST_PLATFORM_SETTINGS_PATH,
} from "@freedmen-s-trucking/types";
import { SecondaryButton } from "~/components/atoms/base";
import { AddressSearchInput } from "~/components/atoms/address-search-input";
import { PiPlus } from "react-icons/pi";

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
  cities: PlaceLocation[];
  removeAt: number;
}> = ({ cities, removeAt }) => {
  const { updatePlatformSettings } = useDbOperations();

  const queryClient = useQueryClient();
  const [canDeleteCity, setCanDeleteCity] = useState<boolean>(false);

  const { mutate: removeCity, isPending: isRemoveCityPending } = useMutation({
    mutationFn: async () => {
      if (!canDeleteCity) return;
      cities.splice(removeAt, 1);
      return updatePlatformSettings({
        availableCities: cities,
      });
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
          className=" bg-black bg-opacity-70 [&>div>div]:bg-primary-50 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
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
const AddCityBtn: React.FC<{ cities: PlaceLocation[] }> = ({ cities }) => {
  const { updatePlatformSettings } = useDbOperations();

  const queryClient = useQueryClient();
  const [canAddCity, setCanAddCity] = useState<boolean>(false);
  const [currentCity, setCurrentCity] = useState<PlaceLocation | null>(null);

  const { mutate: addCity, isPending: isAddCityPending } = useMutation({
    mutationFn: async () => {
      if (!currentCity) return;
      return updatePlatformSettings({
        availableCities: [...cities, currentCity],
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
          className=" bg-black bg-opacity-70 [&>div>div]:bg-primary-50 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-end md:[&>div]:h-auto"
          show={!!canAddCity}
          onClose={() => {
            setCanAddCity(false);
            setCurrentCity(null);
          }}
        >
          <Modal.Header className="[&>button]:rounded-full [&>button]:bg-accent-400 [&>button]:p-[1px] [&>button]:text-primary-100 [&>button]:transition-all  [&>button]:duration-300  hover:[&>button]:scale-110 hover:[&>button]:text-primary-950 ">
            <span className="text-lg font-medium">Add City</span>
          </Modal.Header>
          <Modal.Body className="flex min-h-72 flex-col justify-between gap-4 text-secondary-950">
            <div className="mb-4">
              <AddressSearchInput
                primaryTypes={[
                  "administrative_area_level_1",
                  "administrative_area_level_2",
                ]}
                onAddressChanged={(params) => setCurrentCity(params.place)}
              />
            </div>
            {currentCity && (
              <div className="mb-4">
                <div className="overflow-hidden font-medium">
                  <p>Address: {currentCity.address}</p>
                  <p>
                    lat:{currentCity.latitude}; lng:{currentCity.longitude}
                  </p>
                  <p>
                    bound:low [{currentCity.viewPort.low.latitude},
                    {currentCity.viewPort.low.longitude}]
                  </p>
                  <p>
                    bound:high [{currentCity.viewPort.high.latitude},
                    {currentCity.viewPort.high.longitude}]
                  </p>
                </div>
              </div>
            )}
            <SecondaryButton
              onClick={currentCity ? () => addCity() : undefined}
              isLoading={isAddCityPending}
              className="border-secondary-500 py-2 text-secondary-950"
            >
              ADD
            </SecondaryButton>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

const PlatformSettings = () => {
  const { fetchPlatformSettings } = useDbOperations();

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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary-700">Settings</h2>

      <div className="flex flex-col items-center gap-4 overflow-x-auto rounded-lg shadow-sm">
        <div className="flex w-full items-center justify-between">
          <h3 className="text-lg font-bold text-primary-700">
            Available Cities
          </h3>
          <AddCityBtn cities={settings.data?.availableCities ?? []} />
        </div>
        {(settings.data?.availableCities?.length ?? 0) > 0 && (
          <Table theme={tableTheme} striped>
            <Table.Head>
              <Table.HeadCell>Actions</Table.HeadCell>
              <Table.HeadCell>City</Table.HeadCell>
              <Table.HeadCell>Center</Table.HeadCell>
              <Table.HeadCell>Bounds</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {settings.data.availableCities?.map((city, index, cities) => (
                <Table.Row key={index}>
                  <Table.Cell>
                    <RemoveCityBtn cities={cities} removeAt={index} />
                  </Table.Cell>
                  <Table.Cell>{city.address}</Table.Cell>
                  <Table.Cell>
                    <div className="font-medium">
                      lat:{city.latitude}; lng:{city.longitude}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="font-medium">
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
        {!settings.data.availableCities?.length && <p>No cities found</p>}
      </div>
    </div>
  );
};

export default PlatformSettings;
