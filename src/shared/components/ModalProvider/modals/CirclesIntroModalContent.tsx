import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import {
  platformShadow,
  spacing,
  type ThemeColors,
  useTheme,
  useThemedStyles,
} from '@shared/theme';
import type { CirclesIntroModalPayload } from '../modalTypes';

const CLOSE_ANIMATION_DELAY_MS = 260;

type Props = {
  payload: CirclesIntroModalPayload;
  closeModal: () => void;
};

type Slide = {
  key: string;
  icon: string;
  title: string;
  text: string;
};

const SLIDES: Slide[] = [
  {
    key: 'together',
    icon: 'users',
    title: 'Do it together',
    text: 'A circle is you and up to 4 friends committing to the same sentence. Everyone gets their own goal. Same words, own momentum.',
  },
  {
    key: 'invites',
    icon: 'paper-plane',
    title: 'Invites bring it to life',
    text: 'Invite friends on PushMeUp directly, or send a link anywhere. Your goal goes live the moment you post. Nobody waits on joins.',
  },
  {
    key: 'support',
    icon: 'bolt',
    title: 'Push, cheer, nudge',
    text: 'Push a circle-mate forward, cheer their updates, or send a quiet 👋 nudge. One tap can back the whole circle.',
  },
  {
    key: 'updates',
    icon: 'pen-to-square',
    title: 'One update a day',
    text: "Share a short update with your circle. It shows in your lane and everyone's activity. Only the good stuff. Quiet stays quiet.",
  },
  {
    key: 'finish',
    icon: 'trophy',
    title: 'Finish together',
    text: 'When everyone takes the win, the circle completes, with a share card that proves you did it together.',
  },
];

// First-time "Start a Circle" explainer: a swipeable walkthrough of the whole
// circle feature, ending on the CTA that flips the composer toggle on.
export default function CirclesIntroModalContent({ payload, closeModal }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [page, setPage] = useState(0);
  const [sheetWidth, setSheetWidth] = useState(0);

  const isLastPage = page === SLIDES.length - 1;
  // The bottom-sheet host adds horizontal padding, so use the measured content
  // width for paging instead of the full device width.
  const pageWidth = sheetWidth || Math.max(0, windowWidth - spacing.md * 2);

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth <= 0) return;
    setSheetWidth(currentWidth => (currentWidth === nextWidth ? currentWidth : nextWidth));
  }, []);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextPage = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      setPage(Math.max(0, Math.min(SLIDES.length - 1, nextPage)));
    },
    [pageWidth],
  );

  const goToPage = useCallback(
    (nextPage: number) => {
      scrollRef.current?.scrollTo({ x: nextPage * pageWidth, animated: true });
      setPage(nextPage);
    },
    [pageWidth],
  );

  const handlePrimary = useCallback(() => {
    if (!isLastPage) {
      goToPage(page + 1);
      return;
    }

    closeModal();
    if (!payload.onStartCircle) return;

    setTimeout(() => {
      payload.onStartCircle?.();
    }, CLOSE_ANIMATION_DELAY_MS);
  }, [closeModal, goToPage, isLastPage, page, payload]);

  const getDotAnimatedStyle = useCallback(
    (index: number) => {
      const inputRange = SLIDES.map((_, slideIndex) => slideIndex * pageWidth);

      return {
        width: scrollX.interpolate({
          inputRange,
          outputRange: SLIDES.map((_, slideIndex) => (slideIndex === index ? ms(18) : ms(7))),
          extrapolate: 'clamp',
        }),
        backgroundColor: scrollX.interpolate({
          inputRange,
          outputRange: SLIDES.map((_, slideIndex) =>
            slideIndex === index ? colors.tactileMomentumPrimary : colors.onboardingLine,
          ),
          extrapolate: 'clamp',
        }),
      };
    },
    [colors.onboardingLine, colors.tactileMomentumPrimary, pageWidth, scrollX],
  );

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        style={[styles.pager, { width: pageWidth }]}
      >
        {SLIDES.map(slide => (
          <View key={slide.key} style={[styles.slide, { width: pageWidth }]}>
            <View
              style={[
                styles.iconBubble,
                platformShadow({
                  color: '#000',
                  opacity: 0.15,
                  radius: 10,
                  offset: { width: 0, height: 5 },
                }),
              ]}
            >
              <Icon
                set="fa6"
                name={slide.icon}
                iconStyle="solid"
                size={28}
                color={colors.tactileMomentumSecondary}
              />
            </View>

            <TextElement variant="headline" weight="700" style={styles.title}>
              {slide.title}
            </TextElement>
            <TextElement variant="bodySmall" color="muted" style={styles.text}>
              {slide.text}
            </TextElement>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((slide, index) => (
          <Pressable key={slide.key} onPress={() => goToPage(index)} hitSlop={6}>
            <Animated.View style={[styles.dot, getDotAnimatedStyle(index)]} />
          </Pressable>
        ))}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          title={isLastPage ? (payload.primaryActionLabel ?? 'Start my circle') : 'Next'}
          onPress={handlePrimary}
          backgroundColor={colors.tactileMomentumPrimary}
          style={styles.primaryButton}
          textStyle={styles.primaryText}
        />

        <Pressable onPress={closeModal} style={styles.cancelButton}>
          <TextElement variant="body" weight="700" style={styles.cancelText}>
            Not now
          </TextElement>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingBottom: spacing.lg,
    },
    pager: {
      flexGrow: 0,
    },
    slide: {
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: vs(6),
      minHeight: vs(186),
    },
    iconBubble: {
      width: ms(64),
      height: ms(64),
      borderRadius: ms(17),
      backgroundColor: colors.tactileMomentumPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: vs(14),
    },
    title: {
      textAlign: 'center',
      fontSize: ms(22.5),
      lineHeight: ms(27),
      color: colors.text,
    },
    text: {
      textAlign: 'center',
      marginTop: vs(8),
      fontSize: ms(14.5),
      lineHeight: ms(21),
      letterSpacing: 0,
      maxWidth: ms(300),
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: ms(7),
      marginTop: vs(4),
    },
    dot: {
      width: ms(7),
      height: ms(7),
      borderRadius: 999,
      backgroundColor: colors.onboardingLine,
    },
    actions: {
      paddingHorizontal: spacing.md,
      paddingTop: vs(16),
    },
    primaryButton: {
      alignSelf: 'stretch',
      marginVertical: 0,
      marginHorizontal: 0,
      borderRadius: 18,
      minHeight: 58,
    },
    primaryText: {
      color: colors.tactileMomentumSecondary,
    },
    cancelButton: {
      alignSelf: 'center',
      marginTop: vs(12),
    },
    cancelText: {
      color: colors.text,
      textAlign: 'center',
    },
  });
