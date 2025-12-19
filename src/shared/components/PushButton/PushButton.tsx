import React from 'react';
import { ms } from 'react-native-size-matters';
import { colors } from '@shared/theme';
import { TaskType } from '@features/Tasks/types/tasks';
import { getTypeVisual } from '@shared/utils/typeVisuals';
import ButtonBase from '../Buttons/ButtonBase';
import { StyleSheet } from 'react-native';
import TextElement from '../TextElement/TextElement';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export type PushButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  label?: string; // e.g. "Push Usman!"
  size?: 'sm' | 'md';
  taskType?: TaskType;
  buttonStyle?: object;
  loading?: boolean;
};

export default function PushButton({
  onPress,
  disabled = false,
  label = 'Push',
  size = 'sm',
  taskType,
  buttonStyle,
  loading = false,
}: PushButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const { emoji } = getTypeVisual(taskType || 'reminder');

  function TextIcon({ emoji }: { emoji: string }) {
    return <TextElement style={{ fontSize: ms(14) }}>{emoji}</TextElement>;
  }

  const handlePress = () => {
    scale.value = withSpring(0.96, { damping: 15 }, () => {
      scale.value = withSpring(1);
    });

    onPress?.();
  };

  return (
    <Animated.View style={animatedStyle}>
      <ButtonBase
        isLoading={loading}
        title={label}
        onPress={handlePress}
        disabled={disabled}
        icon={<TextIcon emoji={emoji} />}
        backgroundColor={colors[`${taskType || 'reminder'}BgHardest`]}
        textColor={colors.onPrimary}
        borderColor="transparent"
        style={[size === 'sm' && styles.small, size === 'md' && styles.medium, buttonStyle]}
        textStyle={styles.text}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  small: {
    paddingVertical: ms(4),
    paddingHorizontal: ms(6),
    paddingRight: ms(12),
    borderRadius: ms(20),
    marginVertical: 0,
    marginHorizontal: 0,
    alignSelf: 'flex-start',
  },
  medium: {
    paddingVertical: ms(10),
    paddingHorizontal: ms(18),
    borderRadius: ms(22),
  },
  text: {
    fontSize: ms(12),
    fontWeight: '600',
  },
});
