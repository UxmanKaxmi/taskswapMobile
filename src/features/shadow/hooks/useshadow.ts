import { useQuery } from "@tanstack/react-query";
import { getshadow } from "../api/getshadow.api";

export function useshadow() {
  return useQuery({
    queryKey: ["shadow"],
    queryFn: getshadow,
  });
}