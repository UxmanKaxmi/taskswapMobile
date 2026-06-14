import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';
import TextElement from '../TextElement/TextElement';
import { colors } from '@shared/theme';

type AppLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center';
};

const AppLogo = ({ size = 'md', align = 'center' }: AppLogoProps) => {
  return (
    <View style={[styles.container, align === 'left' && styles.alignLeft]}>
      <View style={styles.wordmark}>
        <View style={[styles.logoTicks, tickSizes[size]]} accessibilityElementsHidden>
          <View style={[styles.logoTick, tickHeights[size]]} />
          <View style={[styles.logoTick, styles.logoTickAccent, tickHeights[size]]} />
          <View style={[styles.logoTick, tickHeights[size]]} />
        </View>
        <TextElement variant="body" weight="800" style={[styles.title, titleSizes[size]]}>
          PushMeUp
        </TextElement>
      </View>
    </View>
  );
};

export default AppLogo;
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTicks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTick: {
    borderRadius: 1,
    backgroundColor: colors.onboardingInk,
    transform: [{ skewX: '-18deg' }],
  },
  logoTickAccent: {
    backgroundColor: colors.onboardingPush,
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.4,
    color: colors.onboardingInk,
    marginLeft: ms(7),
  },
});

const titleSizes = {
  sm: {
    fontSize: ms(14),
  },
  md: {
    fontSize: ms(18),
  },
  lg: {
    fontSize: ms(24),
  },
};

const tickSizes = {
  sm: {
    gap: ms(3),
  },
  md: {
    gap: ms(3),
  },
  lg: {
    gap: ms(4),
  },
} as const;

const tickHeights = {
  sm: {
    width: ms(4),
    height: vs(14),
  },
  md: {
    width: ms(4),
    height: vs(16),
  },
  lg: {
    width: ms(5),
    height: vs(20),
  },
} as const;
