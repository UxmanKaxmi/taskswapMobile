import React, { useRef } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { useTheme } from '@shared/theme/useTheme';

type Props = {
  title?: string;
  subtitle?: string;
  icon?: any;
};

export default function EmptyState({ title, subtitle, icon }: Props) {
  const fallbackTitle = title || 'Nothing to show here yet.';
  const viewRef = useRef<Animatable.View & View>(null);
  const { colors } = useTheme();

  return (
    <Animatable.View
      ref={viewRef}
      animation="fadeInUp"
      duration={400}
      useNativeDriver
      style={styles.container}
    >
      {icon ? <Image source={icon} style={styles.image} resizeMode="contain" /> : null}
      <TextElement variant="title" style={styles.title}>
        {fallbackTitle}
      </TextElement>
      {subtitle && (
        <TextElement variant="body" style={[styles.subtitle, { color: colors.muted }]}>
          {subtitle}
        </TextElement>
      )}
    </Animatable.View>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: 'transparent',
    alignSelf: 'center',
    flex: 1,
    width: '100%',
  },
  image: {
    width: 250,
    height: 200,
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.sm,
  },
});
