import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

const OSM_PLACE_SEARCH_API = "https://nominatim.openstreetmap.org/search.php";
type OSMSearchResult = {
  place_id: number;
  licence?: string;
  osm_type?: string;
  osm_id?: number;
  lat: string;
  lon: string;
  category?: string;
  type?: string;
  place_rank?: number;
  importance?: number;
  addresstype?: string;
  name: string;
  display_name: string;
  boundingbox?: string[];
};

export type CustomOSMSearchResult = {
  place_id: number;
  latitude: number;
  longitude: number;
  name: string;
  display_name: string;
};

export const useGeocoding = () => {
  const [query, setQuery] = useState("");

  const { data, error, isFetching } = useQuery({
    queryKey: ["reponseData", query],
    initialData: [],
    enabled: query.trim().length > 2,
    queryFn: async () => {
      const params = new URLSearchParams({
        countrycodes: "us",
        layer: "address",
        format: "jsonv2",
        q: query,
      });

      const response = await fetch(
        `${OSM_PLACE_SEARCH_API}?${params.toString()}`,
      );

      if (response.status >= 400) {
        throw new Error(response.statusText);
      }
      const data: OSMSearchResult[] = await response.json();
      return data.map((item) => ({
        latitude: Number(item.lat),
        longitude: Number(item.lon),
        name: item.name,
        display_name: item.display_name,
        place_id: item.place_id,
      }));
    },
  });

  const searchPlaceOSM = useCallback((query: string) => {
    console.log("searchPlaceOSM", query);
    setQuery(query.trim());
  }, []);

  return { searchPlaceOSM, isFetching, data, error, query };
};
