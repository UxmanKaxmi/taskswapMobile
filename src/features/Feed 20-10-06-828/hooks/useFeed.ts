import { useQuery } from "@tanstack/react-query";
import { getFeedData } from "../api/feed.api";

export function useFeed() {
  return useQuery({
    queryKey: ["Feed"],
    queryFn: getFeedData,
  });
}