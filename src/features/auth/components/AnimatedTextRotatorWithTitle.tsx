// AnimatedTextRotatorWithTitle.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Image, ImageSourcePropType, Dimensions } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import TextElement from '@shared/components/TextElement/TextElement';
const { width, height } = Dimensions.get('window');

type MessagePair = {
  mainTitle: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType; // ← new
};

type Props = {
  messages: MessagePair[];
  interval?: number;
  mainTitleStyle?: object;
  titleStyle?: object;
  subtitleStyle?: object;
  imageStyle?: object; // ← optional override
};

export default function AnimatedTextRotatorWithTitle({
  messages,
  interval = 3000,
  mainTitleStyle,
  titleStyle,
  subtitleStyle,
  imageStyle,
}: Props) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;

  const animate = () => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.delay(interval - 1000),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIndex(i => (i + 1) % messages.length);
    });
  };

  useEffect(() => {
    animate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const { mainTitle, title, subtitle, image } = messages[index];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageWrapper, { opacity }]}>
        <Image source={image} style={[styles.image, imageStyle]} resizeMode="contain" />
      </Animated.View>

      <Animated.View style={{ opacity }}>
        <TextElement variant="title" style={[styles.mainTitle, mainTitleStyle]}>
          {mainTitle}
        </TextElement>
      </Animated.View>

      <Animated.View style={{ opacity }}>
        <TextElement variant="title" style={[styles.title, titleStyle]}>
          {title}
        </TextElement>
      </Animated.View>
      <Animated.View style={{ opacity }}>
        <TextElement variant="subtitle" style={[styles.subtitle, subtitleStyle]}>
          {subtitle}
        </TextElement>
      </Animated.View>
      {/* New image block */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // alignItems: 'center', // center everything now
  },
  mainTitle: {
    fontSize: moderateScale(35),
    fontWeight: '700',
    marginBottom: moderateScale(8),
    // textAlign: 'center',
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '500',
    marginBottom: moderateScale(8),
    textAlign: 'left',
  },
  subtitle: {
    fontSize: moderateScale(18),
    fontWeight: '400',
    marginBottom: moderateScale(12),
    // textAlign: 'center',
  },
  imageWrapper: {},
  image: {
    width: width * 0.9,
    height: height * 0.2,
  },
});
