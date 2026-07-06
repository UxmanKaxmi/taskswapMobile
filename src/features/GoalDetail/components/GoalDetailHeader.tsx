import React from 'react';
import { View, StyleSheet, Pressable, type GestureResponderEvent } from 'react-native';
import { ms } from 'react-native-size-matters';

import Avatar from '@shared/components/Avatar/Avatar';
import { getAvatarColor } from '@shared/utils/avatarColor';
import Row from '@shared/components/Layout/Row';
import TextElement from '@shared/components/TextElement/TextElement';
import HelperAvatarGroup from '@features/Home/components/HelperAvatarGroup';

import { ThemeColors, useThemedStyles } from '@shared/theme';
import { timeAgo, toShortName } from '@shared/utils/helperFunctions';
import { GoalType } from '@features/Goals/types/goals';
import { HelperUser } from '@features/Home/types/home';
import Ripple from '@shared/components/Buttons/Ripple';
import { openFriendsProfile } from '@navigation/types/navigationUtils';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '@navigation/types/navigation';
import { useAuth } from '@features/Auth/AuthProvider';
import { isAnonOwnerId } from '@shared/utils/anonymity';
import GoalStatusPill from './GoalStatusPill';
import { useModal } from '@shared/components/ModalProvider';

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
    isAnonymous?: boolean;
    avatarColor?: string;
  };
};

export function GoalDetailHeader({ task }: Props) {
  const styles = useThemedStyles(createStyles);
  const avatarSize = ms(45);

  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { user } = useAuth();
  const { openModal } = useModal();

  // Anonymous goals: the masked owner id never resolves to a profile, so the
  // author chip must not navigate anywhere.
  const canOpenProfile = !isAnonOwnerId(task.userId);
  const isOwnAnonymousGoal = task.isAnonymous === true && !!user?.id && task.userId === user.id;

  const handleOpenProfile = () => {
    if (!canOpenProfile) return;
    openFriendsProfile(navigation, task?.userId || '', user?.id);
  };

  const handleAnonymousBadgePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    openModal('anonymousPostingInfo', {
      userName: user?.name ?? 'you',
      mode: 'posted',
      primaryActionLabel: 'Got it',
      hideSecondaryAction: true,
    });
  };

  return (
    <Row align="center" justify="flex-start">
      {/* Avatar + helpers */}
      <View style={[styles.avatarWrapper, { width: avatarSize, height: avatarSize }]}>
        <Ripple onPress={handleOpenProfile}>
          <Avatar
            uri={task.avatar}
            fallback={task.name}
            size={avatarSize}
            borderColor="transparent"
            fallbackStyle={{
              backgroundColor: task.avatarColor ?? getAvatarColor(task.userId || task.name),
            }}
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
        <Ripple onPress={handleOpenProfile}>
          <Row gap={4} justify="flex-start" align="center">
            <TextElement variant="subtitle" style={styles.name}>
              {toShortName(task.name)}
            </TextElement>
            {isOwnAnonymousGoal ? (
              <Pressable
                onPress={handleAnonymousBadgePress}
                accessibilityRole="button"
                accessibilityLabel="Anonymous posting info"
                hitSlop={8}
                style={({ pressed }) => [styles.anonBadge, pressed && styles.anonBadgePressed]}
              >
                <TextElement variant="caption" weight="700" style={styles.anonBadgeText}>
                  Anonymous
                </TextElement>
              </Pressable>
            ) : null}
          </Row>
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
      color: colors.tactileMomentumSecondary,
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

    anonBadge: {
      backgroundColor: colors.muted + '22',
      borderRadius: 999,
      paddingHorizontal: ms(5),
      paddingVertical: ms(1),
    },

    anonBadgePressed: {
      opacity: 0.7,
    },

    anonBadgeText: {
      color: colors.muted,
      fontSize: ms(8),
      lineHeight: ms(11),
      letterSpacing: 0.2,
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
