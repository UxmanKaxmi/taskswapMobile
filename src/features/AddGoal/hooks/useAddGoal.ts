import { useQuery } from "@tanstack/react-query";
import { getGoalsPage } from "@features/Goals/api/goalApi";

export function useAddGoal() {
  return useQuery({
    queryKey: ["AddGoal"],
    queryFn: () => getGoalsPage(),
  });
}
