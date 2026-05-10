// src/shared/components/MotivationOpeningQuote.tsx

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ms } from 'react-native-size-matters';
import { colors } from '@shared/theme';
import { resolveAppTextStyle } from '@shared/theme/fonts';

export default function MotivationOpeningQuote() {
  return (
    <Text style={resolveAppTextStyle(styles.quote, { variant: 'title' })} pointerEvents="none">
      “
    </Text>
  );
}

const styles = StyleSheet.create({
  quote: {
    position: 'absolute',
    top: ms(-10),
    left: ms(-6),
    fontSize: ms(64),
    lineHeight: ms(64),
    color: colors.motivationBgHardest,
    opacity: 0.15,
    fontWeight: '800',
  },
});
