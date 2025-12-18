import { useQuery } from "@tanstack/react-query";
import { getRecommendation } from "../api/getRecommendation.api";

export function useRecommendation() {
  return useQuery({
    queryKey: ["Recommendation"],
    queryFn: getRecommendation,
  });
}