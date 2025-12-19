import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import { colors } from '@shared/theme';
import Ripple from '@shared/components/Buttons/Ripple';
import { formatViews, getFirstName, toShortName } from '@shared/utils/helperFunctions';
import PushButton from '@shared/components/PushButton';
import { TaskType } from '../types/home';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import { ms, vs } from 'react-native-size-matters';
import { isDEV } from '@shared/utils/constants';
import { usePushInteraction } from '../hooks/usePushInteraction';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface ExtraMeta {
  icon: string;
  count: number;
}

interface Props {
  commentCount?: number;
  shareHandler?: () => void;
  viewCount?: number;
  extra?: ExtraMeta;
  onPressComments?: () => void;
  taskDetails?: any;
  hasPushed: boolean;
  pushCount: number;
  onPressPush: () => void;
  isPushing?: boolean;
  onPressUnpush?: () => void; //TEST ONLY
}

export default function TaskFooter({
  commentCount = 0,
  shareHandler,
  viewCount,
  extra,
  onPressComments,
  taskDetails,
  hasPushed = false,
  pushCount = 0,
  onPressPush,
  onPressUnpush,
  isPushing = false,
}: Props) {
  const {
    hasPushed: pushed,
    pushedText,
    handlePush,
    handleUnpush,
  } = usePushInteraction({
    hasPushed,
    pushCount,
    onPush: onPressPush,
    onUnpush: onPressUnpush,
    isPushing,
  });

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const hasMounted = useRef(false);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    opacity.value = withTiming(0, { duration: 80 }, () => {
      translateY.value = pushed ? 2 : 0;
      opacity.value = withTiming(1, { duration: 150 });
    });
  }, [pushed]);

  return (
    <View>
      <AppBorder
        color={colors[`${taskDetails?.type}BgHard` as keyof typeof colors]}
        style={{ marginBottom: vs(16) }}
      />
      <View style={styles.footer}>
        {taskDetails?.type === TaskTypeEnum.Motivation && (
          <Animated.View style={[animatedStyle, { flex: 1 }]}>
            {!pushed ? (
              <PushButton
                onPress={handlePush}
                loading={isPushing}
                taskType={TaskTypeEnum.Motivation}
                label={`Push ${getFirstName(taskDetails?.name)}!`}
                size="sm"
              />
            ) : (
              <>
                <TextElement style={styles.pushedText}>{pushedText}</TextElement>

                {isDEV && (
                  <TouchableOpacity onPress={handleUnpush} style={styles.unpushButton}>
                    <TextElement style={styles.unpushText}>Unpush (dev)</TextElement>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Animated.View>
        )}
        {/* {taskDetails?.type === TaskTypeEnum.Advice && (
          <View style={{ flex: 1 }}>
            {!hasPushed ? (
              <PushButton
                onPress={() => {}}
                taskType={TaskTypeEnum.Advice}
                label={`Suggest advice`}
                size="sm"
                buttonStyle={{ paddingLeft: ms(10) }}
              />
            ) : (
              <TextElement style={styles.pushedText}>{pushedTextAdvice}</TextElement>
            )}
          </View>
        )} */}

        {/* View Count */}
        {/* {typeof viewCount === 'number' && (
          <View style={[styles.action]}>
            <Icon name="eye-outline" size={16} color={colors.muted} set="ion" />
            <TextElement style={styles.count}>{formatViews(viewCount)}</TextElement>
          </View>
        )} */}

        {/* Comments */}
        <Ripple style={styles.action} onPress={onPressComments}>
          <Icon set="fa6" name="comment" size={ms(14)} color={colors.muted} />
          <TextElement style={styles.count}>{commentCount}</TextElement>
        </Ripple>

        {/* Share */}
        {/* <Ripple style={styles.action} onPress={shareHandler}>
          <Icon name="share-outline" size={16} color={colors.muted} set="ion" />
        </Ripple> */}

        {/* Extra (votes/helpers/etc) */}
        {/*
{extra?.icon && (
  <View style={styles.action}>
    <Icon name={extra.icon} size={18} variant="text" />
    <TextElement style={styles.count}>{extra.count}</TextElement>
  </View>
)}
*/}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  unpushButton: {
    marginTop: vs(6),
  },

  unpushText: {
    fontSize: ms(11),
    color: colors.error,
    opacity: 0.6,
  },
  pushedText: {
    // marginTop: vs(6),
    fontSize: ms(12),
    color: colors.muted,
    opacity: 0.6,
    // backgroundColor: 'red',
  },
  footer: {
    gap: 20,
    flexDirection: 'row',
    // paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  count: {
    marginLeft: 6,
    color: colors.muted,
    fontSize: ms(14),
  },
});
