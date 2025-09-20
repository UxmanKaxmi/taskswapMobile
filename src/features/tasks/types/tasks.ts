// ✅ Define all possible task types
export type TaskType = 'reminder' | 'decision' | 'motivation' | 'advice';

// ✅ Full Task object (received from API)
export type Task = {
  votedOption: any;
  completedAt: string;
  completed: boolean;
  id: string;
  text: string;
  type: TaskType;
  createdAt: string;
  userId: string;
  remindAt?: string; // for reminder tasks
  options?: string[]; // for decision tasks
  deliverAt?: string; // for motivation tasks
  avatar?: string;
  name?: string;

  helpers?: string[];
  votes: {
    [option: string]: {
      count: number;
      preview: Voter[];
    };
  };
};

// ✅ Payload used for task creation
export interface TaskPayload {
  text: string;
  type: TaskType;
  remindAt?: string;
  options?: string[];
  deliverAt?: string;
  avatar?: string;
  name?: string;
  helpers?: string[]; // ✅ unified name with backend
}

// ✅ Payload used for task updates (partial and flexible)
export interface UpdateTaskInput {
  id: string;
  data: Partial<{
    text: string;
    type: TaskType;
    remindAt?: string;
    options?: string[];
    deliverAt?: string | null;
    avatar?: string;
    name?: string;
    helpers?: string[]; // ✅ unified name with backend
  }>;
}

export type Voter = {
  id: string;
  name: string;
  photo?: string;
};

// comment.ts
export type TaskComment = {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  user: { id: string; name: string; photo?: string };

  // 👍 likes
  likesCount: number; // total hearts
  likedByMe: boolean; // current user liked?
};

// For toggling like
export interface ToggleCommentLikePayload {
  commentId: string;
  like: boolean; // true = like, false = unlike
}
