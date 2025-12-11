import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Swiper from 'react-native-swiper';
import LinearGradient from 'react-native-linear-gradient';
import { Layout } from '@shared/components/Layout';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import TextElement from '@shared/components/TextElement/TextElement';
import { Height } from '@shared/components/Spacing';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isDEV, isPROD } from '@shared/utils/constants';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    image: require('@assets/images/slider1.png'),
    title: 'Your Daily Boost of Motivation',
    subtitle:
      'Discover inspiring actions, progress updates, and uplifting posts from people just like you.',
  },
  {
    image: require('@assets/images/slider2.png'),
    title: 'Motivate Each Other, Every Day',
    subtitle:
      'Add friends, share your goals, and give each other gentle pushes when someone needs it.',
  },
  {
    image: require('@assets/images/slider3.png'),
    title: 'Small Steps. Big Change.',
    subtitle:
      'Post quick updates, track streaks, and celebrate progress — one tiny push at a time.',
  },
];

const IntroScreen = ({ navigation }: { navigation: any }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleStart = async () => {
    if (isDEV) {
      // Production mode — only show onboarding once
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } else {
      // Dev mode — always show onboarding for testing
      await AsyncStorage.removeItem('hasSeenOnboarding');
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      navigation.replace('App');
    });
  };
  return (
    <Layout>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          top: height * 0.02,
        }}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require('@assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <Swiper
        autoplay
        loop={true}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        showsPagination
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.container}>
            <Image source={slide.image} style={styles.image} resizeMode="contain" />
            <TextElement variant="title" style={styles.title}>
              {slide.title}
            </TextElement>
            <TextElement variant="caption" style={styles.subtitle}>
              {slide.subtitle}
            </TextElement>
          </View>
        ))}
      </Swiper>

      <PrimaryButton onPress={handleStart} title="Let’s Start ➜" />
      <Height size={20} />
    </Layout>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: width * 0.55,
    height: height * 0.15,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // paddingHorizontal: 24,
  },
  image: {
    height: height * 0.35,
    width: width * 0.85,
    marginBottom: 30,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#707070',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#6D5DFB',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 240,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  arrow: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  dot: {
    backgroundColor: '#E0E0E0',
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 4,
  },
  activeDot: {
    backgroundColor: '#6D5DFB',
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 4,
  },
});
