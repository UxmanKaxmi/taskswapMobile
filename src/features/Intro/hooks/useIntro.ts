import { useQuery } from "@tanstack/react-query";
import { getIntro } from "../api/getIntro.api";

export function useIntro() {
  return useQuery({
    queryKey: ["Intro"],
    queryFn: getIntro,
  });
}