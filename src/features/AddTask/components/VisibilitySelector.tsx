import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';

import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { useTheme } from '@shared/theme/useTheme';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';

import { ms } from 'react-native-size-matters';
import { TaskType } from '@features/Home/types/home';
import { getVisibilityHelperText } from '../utils/taskCopy';

type Visibility = 'public' | 'friends' | 'private';

const OPTIONS = [
  { key: 'public', label: 'Public', icon: 'globe-outline' },
  { key: 'friends', label: 'Friends', icon: 'people-outline' },
  { key: 'private', label: 'Private', icon: 'lock-closed-outline' },
] as const;

const TRACK_PADDING = 4;

type Props = {
  value: Visibility;
  onChange: (v: Visibility) => void;
  taskType: TaskType;
};

export default function VisibilitySelector({ value, onChange, taskType }: Props) {
  const { colors } = useTheme();

  const translateX = useRef(new Animated.Value(0)).current;
  const helperOpacity = useRef(new Animated.Value(1)).current;
  const helperTranslateY = useRef(new Animated.Value(0)).current;

  const [width, setWidth] = useState(0);

  const index = OPTIONS.findIndex(o => o.key === value);
  const trackWidth = width - TRACK_PADDING * 2;
  const segmentWidth = trackWidth / OPTIONS.length;
  const prevValue = useRef<Visibility | null>(null);
  const userInitiatedRef = useRef(false);
  const [showHelper] = useState(true);

  function getIconName(baseIcon: string, selected: boolean): string {
    if (!selected) return baseIcon;

    // Remove "-outline" for selected state
    return baseIcon.replace('-outline', '') as string;
  }

  /* ──────────────────────────────────────
     Helper text animation (on change only)
     ────────────────────────────────────── */
  useEffect(() => {
    // Ignore first render completely
    if (prevValue.current === null) {
      prevValue.current = value;
      return;
    }

    // Only react to user interaction
    if (!userInitiatedRef.current) {
      prevValue.current = value;
      return;
    }

    userInitiatedRef.current = false;
    prevValue.current = value;

    // Animate helper
    helperOpacity.setValue(0);
    helperTranslateY.setValue(6);

    Animated.parallel([
      Animated.timing(helperOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(helperTranslateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value]);

  /* ──────────────────────────────────────
     Sliding indicator animation
     ────────────────────────────────────── */
  useEffect(() => {
    if (!width) return;

    Animated.spring(translateX, {
      toValue: segmentWidth * index,
      useNativeDriver: true,
      damping: 18,
      stiffness: 160,
    }).start();
  }, [index, width]);

  return (
    <View style={styles.wrapper}>
      <SectionHeader label="Who do you want support from?" icon="eye" />

      <Shadow size="tint">
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
          onLayout={e => setWidth(e.nativeEvent.layout.width)}
        >
          {/* Sliding Indicator */}
          {width > 0 && (
            <Animated.View
              style={[
                styles.indicator,
                {
                  width: segmentWidth,
                  backgroundColor: colors.card,
                  transform: [{ translateX }],
                },
              ]}
            />
          )}

          {/* Options */}
          {OPTIONS.map(opt => {
            const selected = value === opt.key;

            return (
              <Pressable
                key={opt.key}
                onPress={() => {
                  userInitiatedRef.current = true;
                  onChange(opt.key);
                }}
                style={styles.option}
              >
                <Icon
                  set="ion"
                  name={getIconName(opt.icon, selected) as any}
                  size={ms(16)}
                  color={selected ? colors[`${taskType}BgHardest`] : colors.muted}
                  style={{
                    transform: [{ scale: selected ? 1.05 : 1 }],
                  }}
                />

                <TextElement
                  variant="caption"
                  style={{
                    fontSize: ms(12),
                    fontWeight: selected ? '500' : '300',
                    color: selected ? colors[`${taskType}BgHardest`] : colors.muted,
                  }}
                >
                  {opt.label}
                </TextElement>
              </Pressable>
            );
          })}
        </View>
      </Shadow>

      {/* Helper Text */}
      {showHelper && (
        <Animated.View
          style={[
            styles.helperContainer,
            {
              opacity: helperOpacity,
              transform: [{ translateY: helperTranslateY }],
            },
          ]}
        >
          <Icon
            set="ion"
            name="information-circle-outline"
            size={ms(12)}
            color={colors[`${taskType}BgHardest`]}
          />
          <TextElement
            variant="caption"
            style={{
              color: colors[`${taskType}BgHardest`],
              fontSize: ms(12),
              fontWeight: '500',
              opacity: 0.8,
            }}
          >
            {getVisibilityHelperText(value, taskType)}
          </TextElement>
        </Animated.View>
      )}
    </View>
  );
}

/* ──────────────────────────────────────
   Styles
   ────────────────────────────────────── */
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
  },
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: TRACK_PADDING,
    left: TRACK_PADDING,
    bottom: TRACK_PADDING,
    borderRadius: 10,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 4,
    zIndex: 1,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 4,
  },
});
