import React, { useRef } from 'react';
import {
  Animated,
  Text,
  View,
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { moderateScale, vs } from 'react-native-size-matters';
import Row from '../Layout/Row';

const AnimatedTouchable = Animated.createAnimatedComponent(Animated.View);

type Props = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function ButtonBase({
  title,
  onPress,
  isLoading = false,
  icon,
  backgroundColor,
  textColor,
  borderColor = 'transparent',
  disabled = false,
  style,
  textStyle,
}: Props) {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const bgColor = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      disabled ? '#ccc' : backgroundColor,
      disabled ? '#bbb' : shadeColor(backgroundColor, -20),
    ],
  });

  return (
    <AnimatedTouchable
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: disabled ? '#ccc' : borderColor,
        },
        style, // custom style overrides
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
      onTouchMove={handlePressOut}
      onStartShouldSetResponder={() => true}
      onResponderRelease={e => {
        handlePressOut();
        if (!isLoading && !disabled) onPress(e);
      }}
      pointerEvents={isLoading || disabled ? 'none' : 'auto'}
    >
      {isLoading ? (
        <Row flex>
          <ActivityIndicator color={textColor} />
        </Row>
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.text, { color: disabled ? '#888' : textColor }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </AnimatedTouchable>
  );
}

function shadeColor(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) + percent);
  const g = Math.max(0, ((num >> 8) & 0xff) + percent);
  const b = Math.max(0, (num & 0xff) + percent);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingVertical: moderateScale(15),
    paddingHorizontal: moderateScale(24),
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: vs(10),
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  iconWrapper: {
    marginRight: 8,
  },
});
