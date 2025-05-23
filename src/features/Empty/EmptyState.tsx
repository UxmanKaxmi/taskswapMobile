import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';

type Props = {
  title?: string;
  subtitle?: string;
  icon?: any;
};

export default function EmptyState({ title, subtitle, icon }: Props) {
  const fallbackTitle = title || 'Nothing to show here yet.';
  const viewRef = useRef<Animatable.View & View>(null);

  return (
    <Animatable.View
      ref={viewRef}
      animation="fadeInUp"
      duration={400}
      useNativeDriver
      style={styles.container}
    >
      <Image
        source={icon || require('@assets/images/emptyFriend.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <TextElement variant="title" style={styles.title}>
        {fallbackTitle}
      </TextElement>
      {subtitle && (
        <TextElement variant="body" style={styles.subtitle}>
          {subtitle}
        </TextElement>
      )}
    </Animatable.View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.lg,
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
    color: '#777',
  },
});
