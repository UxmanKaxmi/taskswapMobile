import React from 'react';
import { View, StyleSheet } from 'react-native';
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
}

export default function TaskFooter({
  commentCount = 0,
  shareHandler,
  viewCount,
  extra,
  onPressComments,
  taskDetails,
  hasPushed = false,
  pushCount = 21,
}: Props) {
  const othersCount = Math.max(pushCount - 1, 0);

  const pushedText = hasPushed
    ? othersCount > 0
      ? `You and ${othersCount} other${othersCount === 1 ? '' : 's'} pushed this`
      : 'You pushed this'
    : `${pushCount} people pushed this`;

  return (
    <View>
      <AppBorder
        color={colors[`${TaskTypeEnum.Motivation}BgHard`]}
        style={{ marginBottom: vs(16) }}
      />
      <View style={styles.footer}>
        {taskDetails?.type === TaskTypeEnum.Motivation && (
          <View style={{ flex: 1 }}>
            {!hasPushed ? (
              <PushButton
                onPress={() => {}}
                count={pushCount}
                taskType={TaskTypeEnum.Motivation}
                label={`Push ${getFirstName(taskDetails?.name)}!`}
                size="sm"
              />
            ) : (
              <TextElement style={styles.pushedText}>{pushedText}</TextElement>
            )}
          </View>
        )}

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
