// src/features/Tasks/hooks/useVoteStats.ts
import { DecisionTask } from '../types/home';

export function useVoteStats(task?: DecisionTask) {
  if (!task || !task.options || task.options.length < 2) {
    return {
      option1: '',
      option2: '',
      vote1: 0,
      vote2: 0,
      percent1: 50,
      percent2: 50,
      totalVotes: 0,
    };
  }

  const [option1, option2] = task.options;
  const vote1 = task.votes?.[option1]?.count ?? 0;
  const vote2 = task.votes?.[option2]?.count ?? 0;
  const totalVotes = vote1 + vote2;

  return {
    option1,
    option2,
    vote1,
    vote2,
    percent1: totalVotes > 0 ? (vote1 / totalVotes) * 100 : 50,
    percent2: totalVotes > 0 ? (vote2 / totalVotes) * 100 : 50,
    totalVotes,
  };
}
