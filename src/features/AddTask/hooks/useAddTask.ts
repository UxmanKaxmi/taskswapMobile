import { useQuery } from "@tanstack/react-query";
import { getTasksPage } from "@features/Tasks/api/taskApi";

export function useAddTask() {
  return useQuery({
    queryKey: ["AddTask"],
    queryFn: () => getTasksPage(),
  });
}
