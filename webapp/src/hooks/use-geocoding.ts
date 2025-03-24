import { useMutation } from "@tanstack/react-query";

const OSM_PLACE_SEARCH_API = "https://nominatim.openstreetmap.org/search.php";
type OSMSearchResult = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  category: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: string[];
};

export const useGeocoding = () => {
  // const { isPending, error, data } = useQuery({
  //   queryKey: ['repoData'],
  //   queryFn: () =>
  //     fetch('https://api.github.com/repos/TanStack/query').then((res) =>
  //       res.json(),
  //     ),
  // })
  const mutation = useMutation({
    mutationFn: async (query: string) => {
      const params = new URLSearchParams({
        format: "jsonv2",
        q: query,
      });

      const response = await fetch(
        `${OSM_PLACE_SEARCH_API}?${params.toString()}`,
      );
      const data: OSMSearchResult[] = await response.json();
      return data;
    },
  });

  return { searchPlaceOSM: mutation.mutate };
};
