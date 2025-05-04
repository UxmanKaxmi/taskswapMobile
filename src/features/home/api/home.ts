import { api } from '@shared/api/axios';
import { Task } from '../types/home';

export async function getTasks(): Promise<Task[]> {
  console.log('[Token in Axios]', api.defaults.headers.common['Authorization']);
  const response = await api.get('/tasks');
  return response.data;
}

export async function createTask(data: { text: string; type: string }): Promise<Task> {
  const response = await api.post('/tasks', data);
  return response.data;
}
