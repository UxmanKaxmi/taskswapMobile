// src/constants/apiRoutes.ts

// ✅ Central enum for base route paths
export enum ApiRoute {
  TASKS = '/tasks',
  USERS = '/users',
  REMINDER_NOTES = '/reminderNotes', // optional if you expose a direct reminderNote endpoint
}

// ✅ Builder functions for dynamic API routes
export const buildRoute = {
  // 📌 Task Routes
  task: (id: string) => `${ApiRoute.TASKS}/${id}`,
  completeTask: (id: string) => `${ApiRoute.TASKS}/${id}/complete`,
  uncompleteTask: (id: string) => `${ApiRoute.TASKS}/${id}/incomplete`,

  // 📌 User Routes
  user: (id: string) => `${ApiRoute.USERS}/${id}`,
  syncUser: () => `${ApiRoute.USERS}/sync`,

  // 📌 Reminder Note Routes (via Task)
  sendReminder: (taskId: string) => `${ApiRoute.TASKS}/${taskId}/remind`,
  getReminders: (taskId: string) => `${ApiRoute.TASKS}/${taskId}/reminders`,
};
