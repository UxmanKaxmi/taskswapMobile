import { api } from '@shared/api/axios';
import { TaskComment } from '../types/tasks';
import { buildRoute } from '@shared/api/apiRoutes';

// ✅ Fetch all comments for a task
export async function fetchComments(taskId: string): Promise<TaskComment[]> {
  const res = await api.get(buildRoute.getComments(taskId));
  return res.data;
}

// ✅ Add new comment
export async function addComment(payload: {
  taskId: string;
  text: string;
  mentions: string[];
}): Promise<TaskComment> {
  const res = await api.post(buildRoute.addComment(), payload);
  return res.data;
}

// ✅ Toggle like/unlike
export async function toggleCommentLike(
  commentId: string,
  like: boolean,
): Promise<{ likesCount: number; likedByMe: boolean }> {
  const res = await api.post(buildRoute.toggleCommentLike(), { commentId, like });
  return res.data;
}
