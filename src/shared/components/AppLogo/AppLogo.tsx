import React from 'react';
import { Image, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ms } from 'react-native-size-matters';

import TextElement from '../TextElement/TextElement';
import { ThemeColors, useTheme, useThemedStyles } from '@shared/theme';

const LOGO = require('@assets/images/logo.png');
// Same mark with the ink slashes lightened so they survive dark backgrounds
const LOGO_DARK = require('@assets/images/logo-dark.png');

export type AppLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const AppLogo = ({ size = 'md', align = 'center', style, textStyle }: AppLogoProps) => {
  const { scheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, align === 'left' && styles.alignLeft, style]}>
      <View style={styles.wordmark}>
        <Image
          source={scheme === 'dark' ? LOGO_DARK : LOGO}
          resizeMode="contain"
          accessible={false}
          style={[styles.logoImage, logoSizes[size]]}
        />
        <TextElement
          variant="subtitle"
          weight="900"
          style={[styles.title, titleSizes[size], textStyle]}
        >
          PushMeUp
        </TextElement>
      </View>
    </View>
  );
};

export default AppLogo;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
    logoImage: {
      tintColor: undefined,
    },
    title: {
      fontWeight: '900',
      letterSpacing: 0,
      color: colors.onboardingInk,
      marginLeft: ms(4),
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

const logoSizes = {
  sm: {
    width: ms(18),
    height: ms(18),
  },
  md: {
    width: ms(30),
    height: ms(30),
  },
  lg: {
    width: ms(36),
    height: ms(36),
  },
} as const;
