import { api } from '@shared/api/axios';
import { ReminderNoteDTO } from '../types/home';
import { buildRoute } from '@shared/api/apiRoutes';

export async function sendReminderNoteAPI(taskId: string, message: string) {
  const res = await api.post<ReminderNoteDTO>(buildRoute.sendReminder(taskId), {
    message,
  });
  return res.data;
}

export async function getRemindersByTaskAPI(taskId: string) {
  console.log('[🔄 API CALL] Fetching task by ID:', taskId); // ✅ Add this

  const res = await api.get<ReminderNoteDTO[]>(buildRoute.getReminders(taskId));

  return res.data;
}

export async function getTaskByIdAPI(taskId: string) {
  const res = await api.get(buildRoute.task(taskId));

  return res.data;
}
