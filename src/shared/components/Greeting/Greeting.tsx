import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { useGreeting } from './useGreeting';
import { ms } from 'react-native-size-matters';

type Props = {
  name?: string;
  onPressAction?: () => void;
};

export default function Greeting({ name, onPressAction }: Props) {
  const { greetingText, headline } = useGreeting(name);

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <TextElement color="muted" style={styles.greeting}>
        {greetingText} 👋
      </TextElement>

      {/* Headline */}
      <TextElement variant="subtitle" weight="700" style={styles.headline}>
        {headline}
      </TextElement>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  greeting: {
    fontSize: ms(12),
    marginTop: spacing.md,
    // marginBottom: spacing.xs,
  },
  headline: {
    fontSize: ms(20),
  },
});
