// ---------------------------------------------
// ✅ Define all task types strictly
// ---------------------------------------------
export type TaskType = 'reminder' | 'decision' | 'motivation' | 'advice';
export type TabKey = 'all' | 'motivation' | 'advice' | 'decision' | 'reminder';

export type HelperUser = {
  id: string;
  name: string;
  photo?: string;
};

export type Voter = {
  id: string;
  name: string;
  photo?: string;
};

// ---------------------------------------------
// ✅ Shared fields for all tasks
// ---------------------------------------------

export type BaseTask = {
  id: string;
  text: string;
  type: TaskType;
  createdAt: string;

  userId: string;
  avatar?: string;
  name: string;

  helpers: HelperUser[];

  // 🔥 Backend counts (added in your API)
  commentsCount: number;
  reminderNoteCount: number;
  voteCount: number;
  viewCount: number;

  pushCount: number;
  hasPushed: boolean;

  // 🔥 Extra state
  hasReminded: boolean;

  // Voting info (optional — only decision type truly uses it)
  votes?: Record<
    string,
    {
      count: number;
      preview: Voter[];
    }
  >;

  votedOption?: string | null;
};

// ---------------------------------------------
// ✅ Specific task types
// ---------------------------------------------

export type ReminderTask = BaseTask & {
  type: 'reminder';
  remindAt: string;
  completed: boolean;
  completedAt?: string | null;
};

export type DecisionTask = BaseTask & {
  type: 'decision';
  options: string[];
  votes: Record<
    string,
    {
      count: number;
      preview: Voter[];
    }
  >;
  votedOption?: string | null;
};

export type MotivationTask = BaseTask & {
  type: 'motivation';
  deliverAt?: string;
};

export type AdviceTask = BaseTask & {
  type: 'advice';
};

// ---------------------------------------------
// ✅ Union of all tasks
// ---------------------------------------------
export type Task = ReminderTask | DecisionTask | MotivationTask | AdviceTask;

// ---------------------------------------------
// ✅ Reminder Notes
// ---------------------------------------------
export interface ReminderNoteDTO {
  id: string;
  taskId: string;
  senderId: string;
  isSenderCurrentUser?: boolean;
  message: string;
  createdAt: string;
  senderName: string;
  senderPhoto?: string | null;
}

export type TimeFilter = 'latest' | 'today' | 'thisWeek' | 'thisMonth' | 'allTime';

export type FeedFilter = {
  // time: TimeFilter;
  types: TaskType[];
};
