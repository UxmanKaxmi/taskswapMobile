import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, Pressable, Easing } from 'react-native';
import { ms } from 'react-native-size-matters';
import { colors, spacing } from '@shared/theme';
import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import { showToast } from '@shared/utils/toast';
import { showConfirmAlert } from '@shared/utils/confirmAlert';

type Props = {
  option1: string;
  option2: string;
  percent1: number; // 0–100
  percent2: number; // 0–100
  vote1: number;
  vote2: number;
  votedOption?: string;
  canChange?: boolean;
  isSubmitting?: boolean;
  onChangeVote?: (nextOption: string, prevOption?: string) => void;
};

export default function StackedVoteBar({
  option1,
  option2,
  percent1,
  percent2,
  vote1,
  vote2,
  votedOption,
  canChange = true,
  isSubmitting = false,
  onChangeVote,
}: Props) {
  const progress1 = useRef(new Animated.Value(0)).current;
  const progress2 = useRef(new Animated.Value(0)).current;
  const [barW, setBarW] = React.useState(0);
  const measured = barW > 0;

  const winner = useMemo(() => {
    if (percent1 === percent2) return null;
    return percent1 > percent2 ? option1 : option2;
  }, [percent1, percent2]);

  useEffect(() => {
    if (!measured) return;

    Animated.timing(progress1, {
      toValue: percent1 / 100,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(progress2, {
      toValue: percent2 / 100,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [percent1, percent2, measured]);

  const handlePress = (label: string) => {
    if (!canChange) {
      showToast({
        type: 'info',
        title: 'Vote locked',
        message: 'You can’t change your vote once it’s cast.',
      });
      return;
    }

    if (!canChange || isSubmitting) return;
    if (label === votedOption) return;

    showConfirmAlert({
      title: 'You are about to select' + ` "${label}"`,
      message: 'You won’t be able to change your choice later.',
      confirmText: 'Confirm vote',
      onConfirm: () => {
        onChangeVote?.(label, votedOption);
      },
    });
  };

  const renderBar = (label: string, percent: number, votes: number, progress: Animated.Value) => {
    const isWinner = winner === label;

    return (
      <Pressable
        onPress={() => handlePress(label)}
        disabled={isSubmitting}
        style={{ marginBottom: spacing.lg }}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${Math.round(percent)} percent, ${votes} people`}
      >
        {/* Header */}
        <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
          <TextElement
            style={[styles.optionLabel, !isWinner && styles.mutedText]}
            numberOfLines={1}
          >
            {label}
          </TextElement>

          <TextElement style={[styles.percentText, !isWinner && styles.mutedText]}>
            {Math.round(percent)}% ({votes} people)
          </TextElement>
        </Row>

        {/* Bar */}
        <View
          style={styles.barContainer}
          onLayout={e => {
            const w = e.nativeEvent.layout.width;
            if (w && w !== barW) setBarW(w);
          }}
        >
          <Animated.View
            style={[
              styles.barFill,
              {
                backgroundColor: isWinner ? colors.decisionBgHardest : colors.decisionBgSoft,
                opacity: measured ? 1 : 0,
                transform: measured
                  ? [{ translateX: -barW / 2 }, { scaleX: progress }, { translateX: barW / 2 }]
                  : undefined,
              },
            ]}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View>
      {renderBar(option1, percent1, vote1, progress1)}
      {renderBar(option2, percent2, vote2, progress2)}
    </View>
  );
}

const styles = StyleSheet.create({
  optionLabel: {
    fontSize: ms(16),
    fontWeight: '600',
    color: colors.text,
    maxWidth: '70%',
  },

  percentText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: colors.decisionBgHardest,
  },

  mutedText: {
    color: colors.muted,
    fontWeight: '500',
  },

  barContainer: {
    height: ms(20),
    backgroundColor: colors.surface,
    borderRadius: ms(10), // 👈 half of height
    overflow: 'hidden', // 👈 THIS is the mask
  },

  barFill: {
    height: '100%',
    width: '100%',
    borderRadius: ms(7), // 👈 same radius as container
    alignSelf: 'flex-start', // 👈 prevent centering during scale
  },
});
