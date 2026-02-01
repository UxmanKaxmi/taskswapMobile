import { useState } from 'react';
import { Animated, Dimensions, Platform, Easing } from 'react-native';
import BootSplash from 'react-native-bootsplash';

const useNativeDriver = Platform.OS !== 'web';

type Props = {
  onAnimationEnd: () => void;
};

export const AnimatedBootSplash = ({ onAnimationEnd }: Props) => {
  const [translateY] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(1));
  const [logoOpacity] = useState(() => new Animated.Value(1));
  const IS_ANDROID = Platform.OS === 'android';
  const [androidOpacity] = useState(() => new Animated.Value(1));
  const [androidScale] = useState(() => new Animated.Value(1));

  const { container, logo } = BootSplash.useHideAnimation({
    manifest: require('../../../assets/bootsplash/manifest.json'),

    logo: require('../../../assets/bootsplash/logo.png'),
    // darkLogo: require("../assets/bootsplash/dark-logo.png"),
    // brand: require("../assets/bootsplash/brand.png"),
    // darkBrand: require("../assets/bootsplash/dark-brand.png"),

    statusBarTranslucent: true,
    navigationBarTranslucent: true,

    animate: () => {
      if (IS_ANDROID) {
        // ANDROID — centered, fade out
        Animated.parallel([
          Animated.timing(androidOpacity, {
            toValue: 0,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver,
          }),
          Animated.timing(androidScale, {
            toValue: 0.95,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver,
          }),
        ]).start(onAnimationEnd);
      } else {
        // IOS — bottom-left, move down
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -10,
            duration: 220,
            useNativeDriver,
          }),
          Animated.timing(translateY, {
            toValue: 500,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver,
          }),
        ]).start(onAnimationEnd);
      }
    },
  });

  return (
    <Animated.View {...container} style={[container.style]}>
      {IS_ANDROID ? (
        // ✅ ANDROID — centered
        <Animated.Image
          {...logo}
          style={[
            logo.style,
            {
              opacity: androidOpacity,
              transform: [{ scale: androidScale }],
            },
          ]}
        />
      ) : (
        // ✅ IOS — bottom-left
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
          }}
        >
          <Animated.Image
            {...logo}
            style={[
              logo.style,
              {
                width: 400,
                height: 400,
                transform: [{ translateY }],
              },
            ]}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
};
