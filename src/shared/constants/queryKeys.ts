export enum QueryKeys {
  Tasks = 'tasks',
  ReminderNotes = 'reminderNotes',
  User = 'user',
  Auth = 'auth',
}

export const buildQueryKey = {
  tasks: () => [QueryKeys.Tasks],
  taskById: (taskId: string) => [QueryKeys.Tasks, taskId],
  remindersForTask: (taskId: string) => [QueryKeys.ReminderNotes, taskId],
  user: () => [QueryKeys.User],
  auth: () => [QueryKeys.Auth],
};
