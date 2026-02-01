import { useQuery } from "@tanstack/react-query";
import { getAddTask } from "../api/getAddTask.api";

export function useAddTask() {
  return useQuery({
    queryKey: ["AddTask"],
    queryFn: getAddTask,
  });
}