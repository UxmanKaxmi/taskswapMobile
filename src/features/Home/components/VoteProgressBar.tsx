import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ms } from 'react-native-size-matters';
import { colors, spacing } from '@shared/theme';
import Row from '@shared/components/Layout/Row';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';

type Props = {
  option1: string;
  option2: string;
  percent1: number;
  percent2: number;
  votedOption?: string;
};

export default function VoteProgressBar({
  option1,
  option2,
  percent1,
  percent2,
  votedOption,
}: Props) {
  const progress1 = useRef(new Animated.Value(0)).current;
  const progress2 = useRef(new Animated.Value(0)).current;

  const isEqual = Math.round(percent1) === Math.round(percent2);

  useEffect(() => {
    Animated.timing(progress1, {
      toValue: percent1,
      duration: 600,
      useNativeDriver: false,
    }).start();
    Animated.timing(progress2, {
      toValue: percent2,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [percent1, percent2]);

  return (
    <View style={{ marginTop: spacing.sm }}>
      {/* Bar */}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.segment,
            {
              width: progress1.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: colors.primary,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.segment,
            {
              width: progress1.interpolate({
                inputRange: [0, 100],
                outputRange: ['100%', '0%'], // 👈 100 - percent1
              }),
              backgroundColor: colors.secondary,
            },
          ]}
        />
      </View>

      {/* Labels */}
      <Row justify="space-between">
        <Row>
          {votedOption === option1 && !isEqual && (
            <Icon
              name="checkmark-circle"
              set="ion"
              size={ms(18)}
              color={colors.primary}
              style={{ marginLeft: 4 }}
            />
          )}
          <TextElement
            style={[
              styles.label,
              isEqual && styles.neutral,
              votedOption === option1 && { fontWeight: 'bold', color: colors.primary },
            ]}
          >
            {`${option1} (${Math.round(percent1)}%)`}
          </TextElement>
        </Row>

        <Row>
          <TextElement
            style={[
              styles.label,
              isEqual && styles.neutral,
              votedOption === option2 && { fontWeight: 'bold', color: colors.secondary },
            ]}
          >
            {`${option2} (${Math.round(percent2)}%)`}
          </TextElement>
          {votedOption === option2 && !isEqual && (
            <Icon
              name="checkmark-circle"
              set="ion"
              size={ms(18)}
              color={colors.secondary}
              style={{ marginLeft: 4 }}
            />
          )}
        </Row>
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: ms(10),
    width: '100%',
    borderRadius: ms(5),
    overflow: 'hidden',
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  segment: {
    height: '100%',
  },
  label: {
    fontSize: ms(14),
    color: colors.text,
  },
  neutral: {
    color: colors.muted,
    fontWeight: 'normal',
  },
});
