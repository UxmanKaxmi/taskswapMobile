// Response contract for GET /users/me/impact. Field names follow the server
// contract ("task"); the UI renders them as goals.

export type ImpactUser = {
  id: string;
  name: string;
  displayName: string;
  username: string | null;
  photo: string | null;
  avatar: string | null;
  avatarUrl: string | null;
  avatarInitial: string;
  avatarColor: string | null;
};

export type ImpactTopCheer = {
  recipient: ImpactUser;
  taskText: string;
  cheerText: string;
  cheeredAt: string;
  completedAt: string;
  daysToFinish: number;
};

export type ImpactStats = {
  peopleHelped: {
    count: number;
    preview: ImpactUser[];
  };
  giving: {
    peoplePushed: number;
    cheersSent: number;
    tasksBacked: number;
  };
  topCheer: ImpactTopCheer | null;
  journey: {
    tasksFinished: number;
    cheersReceived: number;
    pushesReceived: number;
  };
};
