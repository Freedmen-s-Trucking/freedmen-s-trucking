import { Popover } from "flowbite-react";
import { useGeocoding, CustomOSMSearchResult } from "../../hooks/use-geocoding";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextInput } from ".";

export type OnAddressChangedParams = {
  possibleValues: CustomOSMSearchResult[];
  query: string;
  address: CustomOSMSearchResult | null;
};

export type AddressSearchInputProps = {
  onAddressChanged: (params: OnAddressChangedParams) => void;
} & Omit<
  React.ComponentProps<"input">,
  "onChange" | "type" | "ref" | "autoComplete"
>;

export const AddressSearchInput: React.FC<AddressSearchInputProps> = ({
  onAddressChanged,
  ...inputProps
}) => {
  const { searchPlaceOSM, data, query, isFetching } = useGeocoding();
  const [dataCached, setDataCached] = useState<CustomOSMSearchResult[]>([]);
  const [searchOptionsOpen, setSearchOptionOpen] = useState(false);
  const [addressInfo, setAddressInfo] = useState<{
    query: string;
    address: CustomOSMSearchResult | null;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFetching) {
      setDataCached(data);
    }
  }, [isFetching, data]);

  const onItemClick = useCallback(
    (address: CustomOSMSearchResult | null) => {
      onAddressChanged({
        query: query,
        address,
        possibleValues: dataCached || [],
      });
      setAddressInfo({
        query: query,
        address,
      });

      if (inputRef.current && address) {
        inputRef.current.value = address.display_name || "";
      }
      if (address) {
        setSearchOptionOpen(false);
        return;
      }
    },
    [onAddressChanged, query, dataCached],
  );

  useEffect(() => {
    if (addressInfo?.query !== query) {
      onItemClick(null);
    }
  }, [onItemClick, query, addressInfo?.query]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.oninput = () => {
        console.log(inputRef.current?.value);
        searchPlaceOSM(inputRef.current?.value || "");
        setSearchOptionOpen(query.length > 1);
        setTimeout(() => inputRef.current?.focus(), 10);
      };
      inputRef.current.onblur = () => {
        if (searchOptionsOpen) {
          inputRef.current?.focus();
        }
      };
      inputRef.current.onfocus = () => {
        setTimeout(() => inputRef.current?.focus(), 10);
      };
    }
  }, [query, searchOptionsOpen, searchPlaceOSM]);

  return (
    <>
      <div className="relative w-full">
        <Popover
          arrow={false}
          open={searchOptionsOpen}
          onOpenChange={setSearchOptionOpen}
          className="top-[-18px!important] z-10 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-b-lg border border-secondary-500 bg-primary-50 shadow-lg shadow-primary-900/50"
          content={
            <div className="text-sm text-secondary-800">
              {dataCached.length === 0 && (
                <div className="w-full rounded-b-lg bg-primary-50 px-4 py-2 text-center">
                  No result found
                </div>
              )}
              {dataCached.map((item) => (
                <span key={item.place_id}>
                  <hr className="border-gray-300" />
                  <button
                    onClick={() => onItemClick(item)}
                    className="w-full cursor-pointer px-4 py-2 text-sm hover:bg-primary-100"
                  >
                    {item.display_name}
                  </button>
                </span>
              ))}
            </div>
          }
        >
          <TextInput
            ref={inputRef}
            maxLength={250}
            className="block w-full rounded-xl border border-gray-300 bg-gray-200 p-3 text-sm text-black focus:border-red-400 focus:outline-none focus:ring-transparent"
            {...inputProps}
            type="text"
            autoComplete="off"
          />
        </Popover>
      </div>
    </>
  );
};
