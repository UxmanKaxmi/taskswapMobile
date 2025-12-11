import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import { colors } from '@shared/theme';
import Ripple from '@shared/components/Buttons/Ripple';
import { formatViews } from '@shared/utils/helperFunctions';

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
}

export default function TaskFooter({
  commentCount = 0,
  shareHandler,
  viewCount,
  extra,
  onPressComments,
}: Props) {
  return (
    <View style={styles.footer}>
      {/* View Count */}
      {typeof viewCount === 'number' && (
        <View style={[styles.action, { flex: 1 }]}>
          <Icon name="eye-outline" size={16} color={colors.muted} set="ion" />
          <TextElement style={styles.count}>{formatViews(viewCount)}</TextElement>
        </View>
      )}

      {/* Comments */}
      <Ripple style={styles.action} onPress={onPressComments}>
        <Icon set="fa6" name="comment" size={16} color={colors.muted} />
        <TextElement style={styles.count}>{commentCount}</TextElement>
      </Ripple>

      {/* Share */}
      <Ripple style={styles.action} onPress={shareHandler}>
        <Icon name="share-outline" size={16} color={colors.muted} set="ion" />
      </Ripple>

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
  );
}

const styles = StyleSheet.create({
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
  },
  count: {
    marginLeft: 4,
    color: colors.muted,
    fontSize: 14,
  },
});
