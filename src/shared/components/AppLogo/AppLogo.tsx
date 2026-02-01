import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ms } from 'react-native-size-matters';
import TextElement from '../TextElement/TextElement';

type AppLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center';
};

const AppLogo = ({ size = 'md', align = 'center' }: AppLogoProps) => {
  return (
    <View style={[styles.container, align === 'left' && styles.alignLeft]}>
      <TextElement variant="subtitle" style={[styles.title, titleSizes[size]]}>
        Push Me Up
      </TextElement>
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
  title: {
    fontWeight: '700',
    letterSpacing: 0.3,
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
