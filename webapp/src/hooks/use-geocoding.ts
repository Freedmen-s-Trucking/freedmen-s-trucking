import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { up } from "up-fetch";
import {
  MinPlaceLocation,
  PlaceLocation,
  type,
} from "@freedmen-s-trucking/types";
import { GOOGLE_MAPS_API_KEY } from "~/utils/envs";

const OSM_PLACE_SEARCH_API = "https://nominatim.openstreetmap.org/search.php";
const googleMapPlaceApiRequest = up(fetch, () => ({
  baseUrl: "https://places.googleapis.com",
  headers: { "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY },
  retry: {
    attempts: 1,
    delay: 1000,
    when: (ctx) => {
      // Retry on timeout errors
      if (ctx.error) return (ctx.error as Error).name === "TimeoutError";
      // Retry on 429 server errors
      if (ctx.response) return ctx.response.status === 429;
      return false;
    },
  },
}));

const oSMSearchResult = type({
  place_id: "number",
  licence: type("string").optional(),
  osm_type: type("string").optional(),
  osm_id: type("number").optional(),
  lat: "string",
  lon: "string",
  category: type("string").optional(),
  type: type("string").optional(),
  place_rank: type("number").optional(),
  importance: type("number").optional(),
  addresstype: type("string").optional(),
  name: "string",
  display_name: "string",
  boundingbox: type("string[]").exactlyLength(4).optional(),
});

const googlePlaceResult = type({
  placePrediction: {
    place: "string",
    placeId: "string",
    text: {
      text: "string",
    },
    // types: type("string").array(),
  },
});

const placeAllDetails = type({
  formattedAddress: type("string").optional(), // e.g: "4200 Farm Hill Blvd, Redwood City, CA 94061, USA",
  plusCode: type({
    globalCode: "string", // e.g: "849VCPWM+XW",
    compoundCode: "string", // e.g: "CPWM+XW Redwood City, CA, USA",
  }).optional(),
  location: {
    latitude: "number",
    longitude: "number",
  },
  viewport: type({
    low: {
      latitude: "number",
      longitude: "number",
    },
    high: {
      latitude: "number",
      longitude: "number",
    },
  }).optional(),
  googleMapsUri: type("string").optional(), // e.g: "https://maps.google.com/?cid=4857813702534180152",
  primaryType: type("string").optional(), // e.g: "university",
  shortFormattedAddress: type("string").optional(), // e.g: "Lot 4, 4200 Farm Hill Blvd, Redwood City",
  postalAddress: type({
    regionCode: "string", // e.g: "US",
    languageCode: "string", // e.g: "en-GB",
    postalCode: "string", // e.g: "94061",
    administrativeArea: "string", // e.g: "California",
    locality: "string", // e.g: "Redwood City",
    addressLines: "string[]", // e.g: ["4200 Farm Hill Blvd"],
  }).optional(),
});

const fetchPlacesFromGoogleResult = type({
  suggestions: googlePlaceResult.array().optional(),
});
type FetchPlacesFromGoogleResult = typeof fetchPlacesFromGoogleResult.infer;

// export type CustomOSMSearchResult = {
//   place_id: string;
//   latitude?: number;
//   longitude?: number;
//   display_name: string;
//   viewport?: {
//     low: {
//       latitude: number;
//       longitude: number;
//     };
//     high: {
//       latitude: number;
//       longitude: number;
//     };
//   };
// };

const fetchPlacesFromOSRM = async (query: string) => {
  const fetcher = up(fetch, () => ({
    retry: {
      attempts: 1,
      delay: 1000,
      when: (ctx) => {
        // Retry on timeout errors
        if (ctx.error) return (ctx.error as Error).name === "TimeoutError";
        // Retry on 429 server errors
        if (ctx.response) return ctx.response.status === 429;
        return false;
      },
    },
  }));

  return fetcher(OSM_PLACE_SEARCH_API, {
    method: "GET",
    params: {
      countrycodes: "us",
      layer: "address",
      format: "jsonv2",
      q: query,
    },
    schema: oSMSearchResult.array(),
  });
};

/**
 * Finds autocompleted place based on the user query. ref: https://developers.google.com/maps/documentation/places/web-service/place-autocomplete#fieldmask
 * @param query The text to autocomplete.
 * @returns
 */
export const fetchPlacesFromGoogle = async (
  query: string,
  options: {
    viewPort?: PlaceLocation["viewPort"];
    primaryTypes?: string[];
  },
) => {
  return googleMapPlaceApiRequest("/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "X-Goog-FieldMask":
        "suggestions.placePrediction.place,suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
    },
    body: {
      input: query,
      includedPrimaryTypes: options.primaryTypes,
      includePureServiceAreaBusinesses: false,
      includedRegionCodes: ["us"],
      locationRestriction: options.viewPort
        ? {
            rectangle: options.viewPort,
          }
        : undefined,
    },
    schema: fetchPlacesFromGoogleResult,
  });
};

export const fetchPlaceDetails = async (
  args: MinPlaceLocation & Partial<PlaceLocation>,
): Promise<Required<PlaceLocation>> => {
  if (args.latitude && args.longitude && args.viewPort) {
    return {
      ...args,
      latitude: args.latitude,
      longitude: args.longitude,
      viewPort: args.viewPort,
    };
  }
  const resp = await googleMapPlaceApiRequest(`/v1/places/${args.placeId}`, {
    params: {
      fields: "location,formattedAddress,viewport", // filter only the location field.
    },
    schema: placeAllDetails,
  });

  return {
    ...args,
    viewPort: resp.viewport || args.viewPort!,
    address: resp.formattedAddress || args.address,
    latitude: resp.location.latitude,
    longitude: resp.location.longitude,
  };
};

export const useGeocoding = (type: "OSRM" | "GMAP" = "OSRM") => {
  const [qreq, setQuery] = useState<{
    query: string;
    options?: {
      restrictedGMARecBounds?: PlaceLocation["viewPort"][];
      primaryTypes?: string[];
    };
  }>({
    query: "",
    options: {
      restrictedGMARecBounds: [],
      primaryTypes: [],
    },
  });
  const { query, options } = qreq;

  const { data, error, isFetching } = useQuery({
    queryKey: ["reponseData", query],
    initialData: <MinPlaceLocation[]>[],
    retry: false,
    refetchOnMount: false,
    enabled: query.trim().length > 2,
    queryFn: async () => {
      if (type === "OSRM") {
        // for (const viewport of restrictedGMAViewports) {
        const resp = await fetchPlacesFromOSRM(query);
        return resp.map(
          (suggestion) =>
            <MinPlaceLocation & Partial<PlaceLocation>>{
              address: suggestion.display_name,
              placeId: `${suggestion.place_id}`,
              latitude: Number(suggestion.lat),
              longitude: Number(suggestion.lon),
            },
        );
      }

      if (options?.restrictedGMARecBounds?.length) {
        const resp = await Promise.all(
          options?.restrictedGMARecBounds?.map((viewPort) =>
            fetchPlacesFromGoogle(query, {
              viewPort,
              primaryTypes: options?.primaryTypes,
            }),
          ),
        );
        return resp
          .reduce(
            (acc, curr) => acc.concat(curr.suggestions || []),
            <Required<FetchPlacesFromGoogleResult>["suggestions"]>[],
          )
          .map(
            (suggestion) =>
              <MinPlaceLocation & Partial<PlaceLocation>>{
                address: suggestion.placePrediction.text.text,
                placeId: suggestion.placePrediction.placeId,
              },
          );
      } else {
        const resp = await fetchPlacesFromGoogle(query, {
          primaryTypes: options?.primaryTypes,
        });
        if (!resp.suggestions) return [];
        return resp.suggestions.map(
          (suggestion) =>
            <MinPlaceLocation & Partial<PlaceLocation>>{
              address: suggestion.placePrediction.text.text,
              placeId: suggestion.placePrediction.placeId,
            },
        );
      }
    },
  });

  const searchPlaceOSM = useCallback(
    (qreq: {
      query: string;
      options?: {
        restrictedGMARecBounds?: PlaceLocation["viewPort"][];
        primaryTypes?: string[];
      };
    }) => {
      console.log("searchPlaceOSM", qreq);
      setQuery(qreq);
    },
    [],
  );

  return { searchPlaceOSM, fetchPlaceDetails, isFetching, data, error, query };
};
