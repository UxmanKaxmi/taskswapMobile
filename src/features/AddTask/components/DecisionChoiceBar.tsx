import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import { Shadow } from '@shared/components/Shadow';

type Props = {
  label: string;
  letter: string;
  percent: number; // 0–100
  selected?: boolean;
  onPress?: () => void;
};

export default function DecisionChoiceBar({ label, letter, percent, selected, onPress }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  const showFill = percent > 0 && percent < 100;
  const isFullSelected = percent === 100 && selected;
  const hasVotes = percent > 0;
  useEffect(() => {
    if (showFill) {
      Animated.timing(anim, {
        toValue: percent,
        duration: 450,
        useNativeDriver: false,
      }).start();
    } else {
      anim.setValue(0);
    }
  }, [percent]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={!onPress}>
      <Shadow size="tint" style={[styles.card, isFullSelected && styles.cardSelected]}>
        {/* Proportional fill (ONLY 1–99%) */}
        {showFill && (
          <Animated.View
            style={[
              styles.fill,
              {
                width,
                backgroundColor: selected ? colors.decisionBgHardest : colors.decisionBgSoft,
              },
            ]}
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          <TextElement weight="500" color={isFullSelected ? 'onPrimary' : 'text'}>
            {label}
          </TextElement>

          <View style={styles.right}>
            {hasVotes && (
              <TextElement
                variant="caption"
                weight="500"
                color={isFullSelected ? 'onPrimary' : 'text'}
              >
                {percent}%
              </TextElement>
            )}

            <View style={[styles.badge, selected && styles.badgeSelected]}>
              <TextElement
                style={styles.badgeText}
                color={selected ? 'onPrimary' : 'decisionBgHardest'}
              >
                {letter}
              </TextElement>
            </View>
          </View>
        </View>
      </Shadow>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
  },
  cardSelected: {
    backgroundColor: colors.decisionBgHardest,
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 16,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: vs(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.decisionIconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  badgeSelected: {
    backgroundColor: colors.decisionBgHardest,
  },
  badgeText: {
    fontSize: ms(14),
    fontWeight: '600',
  },
});
