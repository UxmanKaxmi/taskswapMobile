import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { ms } from 'react-native-size-matters';
import { colors, spacing } from '@shared/theme';
import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import { Voter } from '../types/tasks';
import Avatar from '@shared/components/Avatar/Avatar';

type Props = {
  option1: string;
  option2: string;
  percent1: number;
  percent2: number;
  vote1: number;
  vote2: number;
  voters1: Voter[];
  voters2: Voter[];
  votedOption?: string;
};

export default function StackedVoteBar({
  option1,
  option2,
  percent1,
  percent2,
  vote1,
  vote2,
  voters1,
  voters2,
  votedOption,
}: Props) {
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

  const renderBar = (
    label: string,
    percent: number,
    voteCount: number,
    color: string,
    isSelected: boolean,
    voters: Voter[],
    progress: Animated.Value,
  ) => (
    <View style={{ marginBottom: spacing.md }}>
      <Row justify="space-between" style={{ marginBottom: spacing.xs }}>
        <TextElement style={[styles.optionLabel, isSelected && { color, fontWeight: 'bold' }]}>
          {`${label} • ${Math.round(percent)}% • ${voteCount} vote${voteCount !== 1 ? 's' : ''}`}
        </TextElement>
      </Row>
      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.barFill,
            {
              width: progress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: color,
            },
          ]}
        />
      </View>
      {/* Voter Avatars */}
      {voters.length > 0 && (
        <View style={styles.voterContainer}>
          <Row>
            {voters.slice(0, 5).map((voter, index) => (
              <Avatar
                key={voter.id}
                uri={voter.photo}
                fallback={voter.name?.[0]}
                size={ms(24)}
                style={[styles.avatar, { marginLeft: index === 0 ? 0 : -ms(8) }]}
              />
            ))}
          </Row>
          {voters.length > 4 && (
            <TextElement style={styles.moreCountText}>+{voters.length} also voted</TextElement>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View>
      {renderBar(
        option1,
        percent1,
        vote1,
        colors.primary,
        votedOption === option1,
        voters1,
        progress1,
      )}
      {renderBar(
        option2,
        percent2,
        vote2,
        colors.secondary,
        votedOption === option2,
        voters2,
        progress2,
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  optionLabel: {
    fontSize: ms(14),
    color: colors.text,
  },
  barContainer: {
    height: ms(15),
    backgroundColor: colors.border,
    borderRadius: ms(5),
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: ms(5),
  },
  avatar: {
    borderWidth: 2,
    borderColor: colors.background,
  },
  voterContainer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moreCountText: {
    fontSize: ms(12),
    color: colors.muted,
    marginLeft: spacing.sm,
  },
});
