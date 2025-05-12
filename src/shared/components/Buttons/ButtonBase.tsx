import React from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  StyleSheet,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
type Props = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export default function ButtonBase({
  title,
  onPress,
  isLoading = false,
  icon,
  backgroundColor,
  textColor,
  borderColor = 'transparent',
  style,
  textStyle,
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? '#ccc' : backgroundColor,
          borderColor: disabled ? '#ccc' : borderColor,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.text, { color: disabled ? '#888' : textColor }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
    borderRadius: 8,
    borderWidth: 1,
  },
  text: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  iconWrapper: {
    marginRight: 8,
  },
});
