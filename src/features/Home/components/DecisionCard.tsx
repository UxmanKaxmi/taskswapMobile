import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import Column from '@shared/components/Layout/Column';
import { colors, spacing } from '@shared/theme';

import { DecisionGoal } from '../types/home';
import { getTypeVisual, typeIcons } from '@shared/utils/typeVisuals';

import { useCastVote } from '@features/Goals/hooks/useVote';
import { useVoteStats } from '../hooks/useVoteStats';
import { useAuth } from '@features/Auth/AuthProvider';

import GoalHeader from './GoalHeader';
import GoalFooter from './GoalFooter';
import HelperAvatarGroup from './HelperAvatarGroup';
import VoteProgressBar from './VoteProgressBar';
import GoalCardGradient from './GoalCardGradient';

import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import Icon from '@shared/components/Icons/Icon';
import { GoalTypeEnum } from '@features/Goals/types/goals';
import { cardStyles } from './styles';
import DecisionChoiceBar from '@features/AddGoal/components/DecisionChoiceBar';
import { Height } from '@shared/components/Spacing';
import { showConfirmAlert } from '@shared/utils/confirmAlert';
import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';

type Props = {
  task: DecisionGoal;
  onPressCard: (task: DecisionGoal) => void;
  onPressShare?: (task: DecisionGoal) => void;
};

export default function DecisionCard({ task, onPressCard, onPressShare }: Props) {
  const { avatar, name = 'John Doe', createdAt, text, options, helpers, id, type } = task;
  const { emoji } = getTypeVisual(type);

  const { mutate: castVote, isPending } = useCastVote(id);
  const { user } = useAuth();

  const hasVoted = task?.hasVoted;
  const votedOption = task.votedOption ?? null;

  const { option1, option2, percent1, percent2, totalVotes } = useVoteStats(task);

  const checkAuthThenNavigate = useCheckAuthThenNavigate();

  const handleVote = (val: string) => {
    if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Decision' })) return;

    if (!user) return;

    showConfirmAlert({
      title: 'You are about to select' + ` "${val}"`,
      message: 'You won’t be able to change your choice later.',
      confirmText: 'Confirm vote',
      onConfirm: () => {
        castVote({
          nextOption: val,
          prevOption: votedOption ?? undefined,
          me: {
            id: user.id,
            name: user.name,
            photo: user.photo,
          },
        });
      },
    });
  };

  return (
    <Shadow size="tint" style={cardStyles.card}>
      <GoalCardGradient style={cardStyles.gradient} type={type}>
        {/* Decorative background icon */}
        <View style={styles.backgroundShadeView}>
          <Icon
            set="fa6"
            name={typeIcons.decision}
            size={ms(120)}
            color={colors.decisionBgHardest}
            style={styles.backgroundIcon}
          />
        </View>

        <TouchableOpacity
          style={cardStyles.touchable}
          activeOpacity={0.7}
          onPress={() => onPressCard(task)}
        >
          {/* Header */}
          <GoalHeader
            avatar={avatar || ''}
            name={name}
            createdAt={createdAt}
            type={GoalTypeEnum.Decision}
            helpers={helpers}
          />

          {/* Question */}
          <View style={cardStyles.messageRow}>
            <TextElement variant="title" style={cardStyles.mainText}>
              {text}
            </TextElement>
          </View>
          <Height size={vs(12)} />
          {options.map((val, index) => {
            const letter = String.fromCharCode(65 + index);
            const voteCount = task.votes?.[val]?.count ?? 0;
            const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

            return (
              <DecisionChoiceBar
                key={`option-${index}`}
                label={val}
                letter={letter}
                percent={percent}
                selected={hasVoted && votedOption === val}
                onPress={votedOption ? undefined : () => handleVote(val)}
              />
            );
          })}
          {/* Voting / Results */}
          {/* {votedOption || task.completed ? (
            <View style={{ marginTop: spacing.sm }}>
              <TextElement variant="caption" color="muted">
                People voted
              </TextElement>

              <VoteProgressBar
                option1={option1}
                option2={option2}
                percent1={percent1}
                percent2={percent2}
                votedOption={votedOption ?? undefined}
              />

              <TextElement variant="caption" color="muted" style={{ marginTop: spacing.xs }}>
                {totalVotes} vote{totalVotes === 1 ? '' : 's'}
              </TextElement>
            </View>
          ) : (
            <Row style={styles.voteRow}>
              {options.map(val => {
                const percent =
                  totalVotes > 0
                    ? Math.round(((task.votes?.[val]?.count ?? 0) / totalVotes) * 100)
                    : 0;

                return (
                  <TouchableOpacity
                    key={val}
                    style={styles.voteOption}
                    disabled={isPending}
                    onPress={() =>
                      castVote({
                        nextOption: val,
                        prevOption: votedOption ?? undefined,
                        me: {
                          id: user!.id,
                          name: user!.name,
                          photo: user!.photo,
                        },
                      })
                    }
                  >
                    <TextElement weight="600">{val}</TextElement>
                    <TextElement variant="caption" color="muted">
                      {percent}%
                    </TextElement>
                  </TouchableOpacity>
                );
              })}
            </Row>
          )} */}

          {/* Footer */}
          <View style={{ marginTop: spacing.md }}>
            <GoalFooter
              commentCount={task.commentsCount ?? 0}
              viewCount={task.viewCount ?? 0}
              shareHandler={() => onPressShare?.(task)}
              extra={{ icon: 'options-outline', count: totalVotes }}
              taskDetails={task}
            />
          </View>
        </TouchableOpacity>
      </GoalCardGradient>
    </Shadow>
  );
}

const styles = StyleSheet.create({
  backgroundShadeView: {
    position: 'absolute',
    bottom: vs(0),
    right: 5,
    transform: [{ rotate: '20deg' }],
  },
  backgroundIcon: {
    opacity: 0.05,
  },
  voteRow: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  voteOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
});
