import { useQuery } from "@tanstack/react-query";
import { getNewFeature } from "../api/getNewFeature.api";

export function useNewFeature() {
  return useQuery({
    queryKey: ["NewFeature"],
    queryFn: getNewFeature,
  });
}