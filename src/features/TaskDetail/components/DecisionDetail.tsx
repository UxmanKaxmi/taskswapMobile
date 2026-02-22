// src/features/tasks/components/body/DecisionDetail.tsx

import React, { useMemo } from 'react';
import { View } from 'react-native';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import StackedVoteBar from './StackedVoteBar';
import DecisionSignalCard from './DecisionSignalCard';
import { useVoteStats } from '@features/Home/hooks/useVoteStats';
import { useCastVote } from '@features/Tasks/hooks/useVote';
import { useAuth } from '@features/Auth/AuthProvider';
import { spacing } from '@shared/theme';
import BottomSheet from '@gorhom/bottom-sheet';
import AppInfoBottomSheet from '@shared/components/AppInfoBottomSheet/AppInfoBottomSheet';
import TextElement from '@shared/components/TextElement/TextElement';
import { useModal } from '@shared/components/ModalProvider';

type Props = {
  task: {
    id: string;
    votedOption?: string;
    completed?: boolean;
    hasVoted?: boolean;
  };
};

export default function DecisionDetail({ task }: Props) {
  const { user } = useAuth();

  const voteMutation = useCastVote(task.id);

  const { option1, option2, percent1, percent2, vote1, vote2 } = useVoteStats(task);
  const { openInfo } = useModal();

  const totalVotes = vote1 + vote2;

  const winner = useMemo(() => {
    if (vote1 === vote2) return null;
    return vote1 > vote2 ? { label: option1, votes: vote1 } : { label: option2, votes: vote2 };
  }, [vote1, vote2, option1, option2]);

  return (
    <View>
      {/* <SectionHeader label="Decision Analysis" icon="analytics" /> */}

      <StackedVoteBar
        option1={option1}
        option2={option2}
        percent1={percent1}
        percent2={percent2}
        vote1={vote1}
        vote2={vote2}
        votedOption={task.votedOption}
        canChange={!task.completed && !task.hasVoted}
        isSubmitting={voteMutation.isPending}
        onChangeVote={(next, prev) => {
          if (!user) return;

          voteMutation.mutate({
            nextOption: next,
            prevOption: prev,
            me: {
              id: user.id,
              name: user.name,
              photo: user.photo,
            },
          });
        }}
      />

      {/* ✅ Interpretation layer (only when meaningful) */}
      {totalVotes > 0 && (
        <DecisionSignalCard
          winningOption={option1} // 👈 safe default, tie logic will ignore it
          winningVotes={Math.max(vote1, vote2)}
          totalVotes={totalVotes}
          onPressInfo={() =>
            openInfo({
              title: 'How decision insights work',
              description:
                'This shows which option your helpers are leaning toward. A strong signal appears when one option clearly stands out.',
            })
          }
        />
      )}
    </View>
  );
}
