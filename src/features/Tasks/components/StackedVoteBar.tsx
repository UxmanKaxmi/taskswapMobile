import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, Pressable, Easing } from 'react-native';
import { ms } from 'react-native-size-matters';
import { colors, spacing } from '@shared/theme';
import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import { Voter } from '../types/tasks';
import Avatar from '@shared/components/Avatar/Avatar';

type Props = {
  option1: string;
  option2: string;
  percent1: number; // 0–100
  percent2: number; // 0–100
  vote1: number;
  vote2: number;
  voters1: Voter[];
  voters2: Voter[];
  votedOption?: string; // current user's voted label (option1 | option2)
  canChange?: boolean; // ✅ allow changing vote
  isSubmitting?: boolean; // ✅ disable while network call
  onChangeVote?: (nextOption: string, prevOption?: string) => void; // ✅ emit change
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
  canChange = true,
  isSubmitting = false,
  onChangeVote,
}: Props) {
  const progress1 = useRef(new Animated.Value(0)).current; // 0..1
  const progress2 = useRef(new Animated.Value(0)).current; // 0..1
  const [barW, setBarW] = React.useState(0);
  const measured = barW > 0;

  useEffect(() => {
    if (!measured) return; // ✅ wait until we know width
    const t1 = Math.max(0, Math.min(1, percent1 / 100));
    const t2 = Math.max(0, Math.min(1, percent2 / 100));

    Animated.timing(progress1, {
      toValue: t1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(progress2, {
      toValue: t2,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [percent1, percent2, measured]);

  const isEqual = useMemo(
    () => Math.round(percent1) === Math.round(percent2),
    [percent1, percent2],
  );

  const handlePress = (target: string) => {
    if (!canChange || isSubmitting) return;
    if (target === votedOption) return; // no-op
    onChangeVote?.(target, votedOption);
  };
  // translate trick to anchor scale from the LEFT
  const leftPinned = (v: Animated.Value) => [
    { translateX: -barW / 2 },
    { scaleX: v },
    { translateX: barW / 2 },
  ];

  const renderBar = (
    label: string,
    percent: number,
    voteCount: number,
    color: string,
    isSelected: boolean,
    voters: Voter[],
    progress: Animated.Value,
  ) => {
    const tappable = canChange && !isSubmitting;
    return (
      <Pressable
        onPress={() => handlePress(label)}
        disabled={!tappable}
        android_ripple={tappable ? { color: color + '55', borderless: false } : undefined}
        style={{ marginBottom: spacing.md }}
        accessibilityRole={tappable ? 'button' : undefined}
        accessibilityLabel={`${label}, ${Math.round(percent)} percent, ${voteCount} votes${
          tappable ? '. Double tap to change your vote.' : ''
        }`}
        hitSlop={8}
      >
        <Row justify="space-between" style={{ marginBottom: spacing.xs }}>
          <Row align="center" style={{ gap: spacing.xs }}>
            <View
              style={{
                width: ms(8),
                height: ms(8),
                borderRadius: ms(4),
                backgroundColor: color,
              }}
            />
            <TextElement
              style={[styles.optionLabel, isSelected && { color, fontWeight: 'bold' }]}
              numberOfLines={1}
            >
              {`${label} • ${Math.round(percent)}% • ${voteCount} vote${voteCount !== 1 ? 's' : ''}`}
              {isEqual && !isSelected ? ' (tie)' : ''}
            </TextElement>
          </Row>

          {tappable && isSelected && (
            <TextElement style={styles.changeHint}>Tap to change</TextElement>
          )}
        </Row>

        <View
          style={[styles.barContainer, { opacity: isSubmitting ? 0.6 : 1 }]}
          onLayout={e => {
            const w = e.nativeEvent.layout.width;
            if (w && w !== barW) setBarW(w);
          }}
        >
          {/* Hide fill until measured to avoid the weird center-grow frame */}
          <Animated.View
            style={[
              styles.barFill,
              {
                backgroundColor: color,
                width: '100%',
                opacity: measured ? 1 : 0, // ✅ no jank frame
                transform: measured
                  ? [
                      { translateX: -barW / 2 },
                      { scaleX: progress }, // 0..1
                      { translateX: barW / 2 },
                    ]
                  : undefined,
              },
            ]}
          />
        </View>

        {voters.length > 0 && (
          <View style={styles.voterContainer} pointerEvents="none">
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
            {voters.length > 5 && (
              <TextElement style={styles.moreCountText}>+{voters.length - 5} more</TextElement>
            )}
          </View>
        )}
      </Pressable>
    );
  };

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
  optionLabel: { fontSize: ms(14), color: colors.text, maxWidth: '100%' },
  barContainer: {
    height: ms(15),
    backgroundColor: colors.border,
    borderRadius: ms(5), // ✅ keep rounding here
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    // no borderRadius here to avoid distortion during scale
  },
  avatar: { borderWidth: 2, borderColor: colors.background },
  voterContainer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moreCountText: { fontSize: ms(12), color: colors.muted, marginLeft: spacing.sm },
  changeHint: { fontSize: ms(12), color: colors.muted },
});
