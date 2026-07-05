import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import Avatar from '@shared/components/Avatar/Avatar';
import { colors, spacing } from '@shared/theme';
import { ms } from 'react-native-size-matters';
import { HelperUser } from '@features/Home/types/home';
import { GoalTypeEnum } from '@features/Goals/types/goals';

type Props = {
  helpers: HelperUser[];
  onPress: () => void;
  taskType: string;
  isOwner: boolean;
  /** Goal owner's name — used to build viewer-aware support copy. */
  ownerName?: string;
};

function formatNames(helpers: HelperUser[]) {
  if (helpers.length === 1) return helpers[0].name;
  if (helpers.length === 2) return `${helpers[0].name} & ${helpers[1].name}`;
  // if (helpers.length === 3) return `${helpers[0].name}, ${helpers[1].name} & ${helpers[2].name}`;
  return `${helpers[0].name}, ${helpers[1].name} +${helpers.length - 2}`;
}

export default function GoalDetailHelpersRow({
  helpers,
  onPress,
  taskType,
  isOwner,
  ownerName,
}: Props) {
  if (!helpers || helpers.length === 0) return null;

  const visible = helpers.slice(0, 3);
  const isMotivation = taskType === GoalTypeEnum.Motivation;

  const iconBg = isMotivation
    ? colors.onboardingPush
    : colors[`${taskType}IconBackground` as keyof typeof colors];
  const accentColor = isMotivation
    ? colors.onboardingInk
    : (colors[`${taskType}BgHardest` as keyof typeof colors] as string);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Left icon */}
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Icon set="ion" name="people" size={ms(15)} color={accentColor} />
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        {isMotivation ? (
          <>
            <TextElement variant="caption" color="muted" style={styles.subTextHeading}>
              Asked to help
            </TextElement>
            <TextElement style={styles.nameTitle}>{formatNames(helpers)}</TextElement>
          </>
        ) : (
          <>
            <TextElement variant="caption" color="muted" style={styles.subTextHeading}>
              Tagged Helpers
            </TextElement>
            <TextElement style={[styles.subText, { color: accentColor }]}>
              {formatNames(helpers)}
            </TextElement>
          </>
        )}
      </View>

      {/* Avatars */}
      <View style={styles.avatarStack}>
        {visible.map((h, index) => (
          <View key={h.id} style={{ marginLeft: index === 0 ? 0 : ms(-14) }}>
            <Avatar uri={h.photo} fallback={h.name?.[0] ?? '?'} size={28} />
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: '#EEF2FF', // soft blue
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  nameTitle: {
    fontSize: ms(13),
    fontWeight: '700',
    color: colors.onboardingInk,
  },
  subTextHeading: {
    fontSize: ms(12),
    fontWeight: '500',
  },
  subText: {
    fontSize: ms(11),
  },
});
