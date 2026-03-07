import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Row from '@shared/components/Layout/Row';
import HeadingText from '@shared/components/HeadingText';
import Ripple from '@shared/components/Buttons/Ripple';
import { Icon } from '@shared/components/Icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { haptics } from '@shared/utils/haptics';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import { vs } from 'react-native-size-matters';
import { colors, spacing } from '@shared/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onPressSearch: () => void;
  onPressFilter: () => void;
  onPressMore?: () => void;
  onPressDebug?: () => void;
  filterOpen?: boolean;
};

export default function HomeHeader({
  onPressSearch,
  onPressFilter,
  onPressMore,
  onPressDebug,
  filterOpen = false,
}: Props) {
  const rotation = useSharedValue(0);

  //Safe area is needed for here for the animation.
  const insets = useSafeAreaInsets();

  useEffect(() => {
    rotation.value = withTiming(filterOpen ? 180 : 0, { duration: 220 });
  }, [filterOpen]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Row
      justify="space-between"
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      {/* <AppBorder color={colors.border} style={styles.borderWidthFull} /> */}
      {/* App name (kept subtle) */}
      <HeadingText level={2} marginHorizontal={0}>
        Push Me Up
      </HeadingText>

      {/* Actions */}
      <Row gap={20}>
        {onPressDebug && (
          <Ripple
            onPress={() => {
              haptics.open();
              onPressDebug();
            }}
          >
            <Icon set="ion" name="bug-outline" size={vs(15)} />
          </Ripple>
        )}

        <Ripple
          onPress={() => {
            haptics.open();
            onPressSearch();
          }}
        >
          <Icon set="ion" name="search" size={vs(15)} />
        </Ripple>

        {onPressMore && (
          <Ripple
            onPress={() => {
              haptics.open();
              onPressMore();
            }}
          >
            <Icon set="ion" name="ellipsis-vertical" size={vs(12)} />
          </Ripple>
        )}
        {/* <Ripple
          onPress={() => {
            haptics.open();
            onPressFilter();
          }}
        >
          <Animated.View style={animatedIconStyle}>
            <Icon set="ion" name="options-outline" size={24} />
          </Animated.View>
        </Ripple> */}
      </Row>
    </Row>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
  borderWidthFull: {
    borderWidth: StyleSheet.hairlineWidth,
    position: 'absolute',
    bottom: vs(-10),
    left: -20,
    right: 0,
    width: '110%',
    borderColor: colors.border,
  },
});
