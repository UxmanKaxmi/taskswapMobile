import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ms } from 'react-native-size-matters';

import Avatar from '@shared/components/Avatar/Avatar';
import { getAvatarColor } from '@shared/utils/avatarColor';
import Row from '@shared/components/Layout/Row';
import TextElement from '@shared/components/TextElement/TextElement';
import HelperAvatarGroup from '@features/Home/components/HelperAvatarGroup';

import { ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { timeAgo, toShortName } from '@shared/utils/helperFunctions';
import { typeIcons } from '@shared/utils/typeVisuals';
import { GoalType } from '@features/Goals/types/goals';
import { HelperUser } from '@features/Home/types/home';
import { Icon } from '@shared/components/Icons';
import Ripple from '@shared/components/Buttons/Ripple';
import { openFriendsProfile } from '@navigation/types/navigationUtils';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '@navigation/types/navigation';
import { useAuth } from '@features/Auth/AuthProvider';
import GoalStatusPill from './GoalStatusPill';

type Props = {
  task: {
    type: GoalType;
    avatar: string;
    name: string;
    createdAt: string;
    text: string;
    helpers?: HelperUser[];
    completed?: boolean;
    userId?: string;
  };
};

export function GoalDetailHeader({ task }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const avatarSize = ms(45);

  const iconName = typeIcons[task.type];
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { user } = useAuth();

  const getTypeColor = (type: GoalType) => {
    switch (type) {
      case 'advice':
        return colors.adviceBgHardest;
      case 'reminder':
        return colors.reminderBgHardest;
      case 'motivation':
        return colors.motivationBgHardest;
      case 'decision':
        return colors.decisionBgHardest;
      default:
        return colors.muted;
    }
  };

  return (
    <Row align="center" justify="flex-start">
      {/* Avatar + helpers */}
      <View style={[styles.avatarWrapper, { width: avatarSize, height: avatarSize }]}>
        <Ripple onPress={() => openFriendsProfile(navigation, task?.userId || '', user?.id)}>
          <Avatar
            uri={task.avatar}
            fallback={task.name}
            size={avatarSize}
            borderColor="transparent"
            fallbackStyle={{ backgroundColor: getAvatarColor(task.userId || task.name) }}
            textStyle={styles.avatarText}
          />

          {!!task.helpers?.length && (
            <HelperAvatarGroup
              helpers={task.helpers}
              avatarSize={ms(18)}
              containerStyle={styles.helperOverlay}
            />
          )}
        </Ripple>
      </View>

      {/* Name + meta */}
      <View style={{ flex: 1 }}>
        <Ripple onPress={() => openFriendsProfile(navigation, task?.userId || '', user?.id)}>
          <TextElement variant="subtitle" style={styles.name}>
            {toShortName(task.name)}
          </TextElement>
        </Ripple>

        {/* 🔥 Meta row (inline) */}
        <Row gap={1} justify="flex-start" align="center" style={styles.metaRow}>
          {/* <Icon
            set="fa6"
            name={iconName}
            size={ms(10)}
            color={getTypeColor(task.type)}
            iconStyle="solid"
            style={styles.metaIcon}
          /> */}

          <TextElement numberOfLines={1} ellipsizeMode="tail" style={styles.timeText}>
            {timeAgo(task.createdAt)}
          </TextElement>
        </Row>
      </View>
      <GoalStatusPill status={task.completed ? 'completed' : 'active'} />
    </Row>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    avatarWrapper: {
      position: 'relative',
      marginRight: ms(5),
    },

    avatarText: {
      color: colors.onboardingInk,
      fontWeight: '800',
    },

    helperOverlay: {
      position: 'absolute',
      bottom: ms(-2),
      right: ms(-3),
    },

    name: {
      fontSize: ms(16),
      // lineHeight: ms(18),
      fontWeight: '600',
    },

    metaRow: {
      marginLeft: ms(1),
    },

    metaIcon: {
      marginRight: ms(5),
    },

    metaText: {
      fontSize: ms(12),
      fontWeight: '600',
      textTransform: 'capitalize',
    },

    timeText: {
      fontSize: ms(12),
      color: colors.muted,
      flexShrink: 1,
    },

    dot: {
      fontSize: ms(10),
      marginHorizontal: ms(2),
      color: colors.muted,
    },
  });
