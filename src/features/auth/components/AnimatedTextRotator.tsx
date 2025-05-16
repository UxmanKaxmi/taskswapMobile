import TextElement from '@shared/components/TextElement/TextElement';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type Props = {
  messages: string[];
  interval?: number;
  textStyle?: object;
};

export default function AnimatedTextRotator({ messages, interval = 3000, textStyle }: Props) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;

  const animate = () => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(interval - 1000),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIndex(prev => (prev + 1) % messages.length);
    });
  };

  useEffect(() => {
    animate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity }}>
        <TextElement variant="subtitle" style={[styles.text, textStyle]}>
          {messages[index]}
        </TextElement>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
