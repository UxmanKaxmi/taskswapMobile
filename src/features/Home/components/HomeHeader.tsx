import React from 'react';
import { StyleSheet } from 'react-native';
import Row from '@shared/components/Layout/Row';
import HeadingText from '@shared/components/HeadingText';
import Ripple from '@shared/components/Buttons/Ripple';
import { Icon } from '@shared/components/Icons';
import { haptics } from '@shared/utils/haptics';
import { vs } from 'react-native-size-matters';
import { spacing } from '@shared/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isPROD } from '@shared/utils/constants';

type Props = {
  onPressSearch: () => void;
  onPressMore?: () => void;
};

export default function HomeHeader({ onPressSearch, onPressMore }: Props) {
  //Safe area is needed for here for the animation.
  const insets = useSafeAreaInsets();

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
        {/* <Ripple
          onPress={() => {
            haptics.open();
            onPressSearch();
          }}
        >
          <Icon set="ion" name="search" size={vs(15)} />
        </Ripple> */}

        {!isPROD && onPressMore && (
          <Ripple
            onPress={() => {
              haptics.open();
              onPressMore();
            }}
          >
            <Icon set="ion" name="ellipsis-vertical" size={vs(12)} />
          </Ripple>
        )}
      </Row>
    </Row>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
});
