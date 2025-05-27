import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import LinearGradient from 'react-native-linear-gradient';
import { Layout } from '@shared/components/Layout';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import TextElement from '@shared/components/TextElement/TextElement';
import { Height } from '@shared/components/Spacing';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    image: require('@assets/images/slider1.png'),
    title: 'Task Management & To-Do List',
    subtitle:
      'This productive tool is designed to help you better manage your task project-wise conveniently!',
  },
  {
    image: require('@assets/images/slider2.png'),
    title: 'Let Others Help You',
    subtitle: 'Get suggestions, reminders or advice from friends, community or AI.',
  },
  {
    image: require('@assets/images/slider3.png'),
    title: 'Get Motivated Daily',
    subtitle: 'Stay consistent and make progress with streaks, pings, and gamification.',
  },
];

const IntroSliderScreen = ({ navigation }: { navigation: any }) => {
  const handleStart = () => {
    navigation.replace('Login'); // Or navigation.navigate
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
        <Image
          source={require('@assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
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

export default IntroSliderScreen;

const styles = StyleSheet.create({
  logo: {
    width: width * 0.4,
    height: height * 0.1,
    alignSelf: 'center',
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
