import { useState } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import BootSplash from 'react-native-bootsplash';

const useNativeDriver = Platform.OS !== 'web';

type Props = {
  onAnimationEnd: () => void;
};

export const AnimatedBootSplash = ({ onAnimationEnd }: Props) => {
  const [logoOpacity] = useState(() => new Animated.Value(1));
  const [logoScale] = useState(() => new Animated.Value(1));
  const isAndroid = Platform.OS === 'android';

  const { container, logo } = BootSplash.useHideAnimation({
    manifest: require('../../../assets/bootsplash/manifest.json'),

    logo: require('../../../assets/bootsplash/logo.png'),
    // darkLogo: require("../assets/bootsplash/dark-logo.png"),
    // brand: require("../assets/bootsplash/brand.png"),
    // darkBrand: require("../assets/bootsplash/dark-brand.png"),

    statusBarTranslucent: true,
    navigationBarTranslucent: true,

    animate: () => {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver,
        }),
        Animated.timing(logoScale, {
          toValue: 0.96,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver,
        }),
      ]).start(onAnimationEnd);
    },
  });

  return (
    <Animated.View {...container} style={[container.style]}>
      <Animated.Image
        {...logo}
        style={[
          logo.style,
          !isAndroid && {
            width: 400,
            height: 400,
          },
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      />
    </Animated.View>
  );
};
