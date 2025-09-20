import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComments, addComment, toggleCommentLike } from '../api/commentApi';
import { TaskComment } from '../types/tasks';
import { buildQueryKey } from '@shared/constants/queryKeys';

// ✅ Fetch comments for a task
export function useComments(taskId: string) {
  return useQuery<TaskComment[]>({
    queryKey: buildQueryKey.commentsForTask(taskId),
    queryFn: () => fetchComments(taskId),
  });
}

// ✅ Add a new comment (with mentions)
export function useAddComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    // 👇 accept both text and mentions
    mutationFn: ({ text, mentions }: { text: string; mentions: string[] }) =>
      addComment({ taskId, text, mentions }), // ✅ FIXED: send a single object
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: buildQueryKey.commentsForTask(taskId),
      });
    },
  });
}

// ✅ Toggle like/unlike on a comment
export function useToggleCommentLike(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, like }: { commentId: string; like: boolean }) =>
      toggleCommentLike(commentId, like),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: buildQueryKey.commentsForTask(taskId),
      });
    },
  });
}
