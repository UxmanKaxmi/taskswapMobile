// src/features/tasks/hooks/useAddTask.ts
import { useState } from 'react';
import { createTask } from '../api/taskApi';
import { TaskPayload } from '../types/tasks';

export function useAddTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTask = async (data: TaskPayload) => {
    setLoading(true);
    setError(null);

    try {
      await createTask(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return { addTask, loading, error };
}
