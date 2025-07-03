import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
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

type Props = {
  task: DecisionTask;
  onPressCard: (task: DecisionTask) => void;
  onPressSuggest: (task: DecisionTask) => void;
  onPressView: (task: DecisionTask) => void;
};

export default function DecisionCard({ task, onPressCard, onPressSuggest, onPressView }: Props) {
  const { avatar, name = 'John Doe', createdAt, text, options, type, helpers, id } = task;
  const { emoji } = getTypeVisual(type);

  const { mutate: castVote, isPending } = useCastVote(id);
  const votedOption = task.votedOption;
  // const totalVotes = Object.values(task.votes || {}).reduce((a, b) => a + b, 0);
  const [option1, option2] = task.options;
  const vote1 = task.votes?.[option1]?.count ?? 0;
  const vote2 = task.votes?.[option2]?.count ?? 0;
  const totalVotes = vote1 + vote2;

  const percent1 = totalVotes > 0 ? (vote1 / totalVotes) * 100 : 0;
  const percent2 = totalVotes > 0 ? (vote2 / totalVotes) * 100 : 0;

  console.log('vote1,', vote1)
  console.log('vote2,', vote2)

  console.log('percent1', percent1)
  console.log('percent2', percent2)
  console.log({ vote1, vote2, totalVotes, percent1, percent2 });
  const progress1 = useRef(new Animated.Value(0)).current;
  const progress2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress1, {
      toValue: percent1,
      duration: 600,
      useNativeDriver: false,
    }).start();

    Animated.timing(progress2, {
      toValue: percent2,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [percent1, percent2]);

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
      {votedOption ? (
        // ✅ Show vote results
        <View style={{ marginTop: spacing.sm }}>
          <VoteProgressBar
            option1={option1}
            option2={option2}
            percent1={percent1}
            percent2={percent2}
            votedOption={votedOption}
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
                onPress={() => castVote(val)}
                disabled={isPending}
                style={StyleSheet.flatten([
                  styles.buttonHalf,
                  { marginRight: index === 0 ? spacing.sm : 0 },
                ])}
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
