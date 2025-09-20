import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { ms } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import Row from '@shared/components/Layout/Row';
import { colors, spacing, typography } from '@shared/theme';
import { DecisionTask } from '../types/home';
import { timeAgo } from '@shared/utils/helperFunctions';
import TypeTag from '@shared/components/TypeTag/TypeTag';
import { cardStyles } from './styles';
import HelperAvatarGroup from './HelperAvatarGroup';
import { getTypeVisual } from '@shared/utils/typeVisuals';
import { useGetVotes } from '@features/Tasks/hooks/useGetVotes';
import { useCastVote } from '@features/Tasks/hooks/useVote';
import Icon from '@shared/components/Icons/Icon';
import Column from '@shared/components/Layout/Column';
import VoteProgressBar from './VoteProgressBar';
import StackedVoteBar from '@features/Tasks/components/StackedVoteBar';
import { useAuth } from '@features/Auth/AuthProvider';
import { useVoteStats } from '../hooks/useVoteStats';

type Props = {
  task: DecisionTask;
  onPressCard: (task: DecisionTask) => void;
  onPressSuggest: (task: DecisionTask) => void;
  onPressView: (task: DecisionTask) => void;
};

const screenWidth = Dimensions.get('window').width;
const buttonWidth = (screenWidth - spacing.md * 2 - spacing.sm) / 2;

export default function DecisionCard({ task, onPressCard, onPressSuggest, onPressView }: Props) {
  const { avatar, name = 'John Doe', createdAt, text, options, type, helpers, id } = task;
  const { emoji } = getTypeVisual(type);
  const { mutate: castVote, isPending } = useCastVote(id);
  const votedOption = task.votedOption;
  // const totalVotes = Object.values(task.votes || {}).reduce((a, b) => a + b, 0);

  const { option1, option2, vote1, vote2, percent1, percent2, totalVotes } = useVoteStats(task);

  // const [option1, option2] = task.options;
  // const vote1 = task.votes?.[option1]?.count ?? 0;
  // const vote2 = task.votes?.[option2]?.count ?? 0;
  // const totalVotes = vote1 + vote2;
  const { user } = useAuth();
  console.log('task' + task.text, task);
  // const percent1 = totalVotes > 0 ? (vote1 / totalVotes) * 100 : 0;
  // const percent2 = totalVotes > 0 ? (vote2 / totalVotes) * 100 : 0;

  const getFontSize = (text: string) => {
    if (text.length > 18) return ms(12); // very long
    if (text.length > 14) return ms(13); // medium
    return ms(14); // short
  };
  return (
    <TouchableOpacity style={cardStyles.card} activeOpacity={0.7} onPress={() => onPressCard(task)}>
      {/* Header with avatar and time */}

      <Row justify="space-between" style={cardStyles.cardHeader}>
        <Row>
          <Image source={{ uri: avatar }} style={cardStyles.avatar} />
          <View>
            <TextElement variant="subtitle" style={cardStyles.name}>
              {name}
            </TextElement>
            <TextElement variant="caption" style={cardStyles.timeAgo} color="muted">
              {timeAgo(createdAt)}
            </TextElement>
          </View>
        </Row>
        <TypeTag type={type} />
      </Row>

      {/* Question text */}
      <View style={cardStyles.messageRow}>
        <TextElement variant="title">
          {emoji} {text}
        </TextElement>
      </View>

      {/* Options OR Vote Results */}
      {/* Results */}
      {votedOption || task.completed ? (
        <View style={{ marginTop: spacing.sm }}>
          <VoteProgressBar
            option1={option1}
            option2={option2}
            percent1={percent1}
            percent2={percent2}
            votedOption={votedOption ?? undefined}
          />
        </View>
      ) : (
        // ❌ No vote yet — show buttons
        <Row style={styles.buttonGroup}>
          {options.map((val, index) => {
            const voteCount = task.votes?.[val]?.count ?? 0;
            const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

            return (
              <OutlineButton
                key={index}
                title={`${val} (${percent}%)`}
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
                disabled={isPending}
                style={StyleSheet.flatten([
                  styles.buttonHalf,
                  { marginRight: index === 0 ? spacing.sm : 0 },
                ])}
                textStyle={{
                  fontSize: getFontSize(`${val} (${percent}%)`),
                }}
              />
            );
          })}
        </Row>
      )}

      {/* Helpers section (optional) */}
      {helpers && helpers.length > 0 && (
        <View style={{ flex: 1, marginTop: spacing.md }}>
          <TextElement weight="500" variant="subtitle" style={{ fontSize: ms(16) }}>
            Helpers
          </TextElement>
          <HelperAvatarGroup helpers={helpers} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkIcon: {},
  checkIconView: {},
  voteText: {
    fontSize: ms(14),
    // fontWeight: '600',

    color: colors.text,
  },
  buttonGroup: {
    flexWrap: 'nowrap', // 👈 ensure they don’t wrap

    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },

  buttonHalf: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  resultRow: {
    marginTop: spacing.xs,
  },
  progressTrack: {
    flexDirection: 'row',
    height: ms(10),
    width: '100%',
    borderRadius: ms(5),
    overflow: 'hidden',
    backgroundColor: colors.border, // fallback if no votes
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },

  progressSegment: {
    height: '100%',
  },
  neutralColor: {
    color: colors.muted, // or gray
    fontWeight: 'normal',
  },
});
