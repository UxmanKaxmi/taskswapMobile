import React, { useCallback, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import AppModal from '@shared/components/AppModal/AppModal';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import {
  platformShadow,
  spacing,
  type ThemeColors,
  useTheme,
  useThemedStyles,
} from '@shared/theme';
import { useAuth } from '@features/Auth/AuthProvider';
import { useModal } from '@shared/components/ModalProvider';
import { useReportTask } from '@features/Reports/hooks/useReportTask';
import { useBlockUser } from '@features/Reports/hooks/useBlockUser';
import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import { showToast } from '@shared/utils/toast';
import { showConfirmAlert } from '@shared/utils/confirmAlert';
import { getFirstName, stripOuterQuotes } from '@shared/utils/helperFunctions';
import type { CircleLane } from '../types/circles.types';

const MENU_WIDTH = ms(220);

type Props = {
  circleId: string;
  goalText: string;
  lanes: CircleLane[];
  isMember: boolean;
  onLeave: () => void;
};

/**
 * The circle counterpart of GoalModerationMenu: Report a member, Block a
 * member, and (for members) Leave — one ⋯ menu in the header, next to the
 * share icon. Report/block target a specific member, picked from the roster.
 */
export default function CircleOverflowMenu({
  circleId: _circleId,
  goalText,
  lanes,
  isMember,
  onLeave,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { user } = useAuth();
  const { openReportTaskSheet } = useModal();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const reportTask = useReportTask();
  const blockUser = useBlockUser();
  const triggerRef = useRef<any>(null);
  const { width: windowWidth } = useWindowDimensions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const otherLanes = lanes.filter(lane => lane.userId !== user?.id && lane.taskId);

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  // Actions that present something (sheet/alert) must wait for the menu Modal
  // to finish dismissing — presenting mid-dismissal is silently dropped on
  // iOS. Modal.onDismiss is iOS-only, so Android runs them directly.
  const pendingActionRef = useRef<(() => void) | null>(null);

  const runPendingAction = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }, []);

  const closeMenuThenRun = useCallback(
    (action: () => void) => {
      pendingActionRef.current = action;
      closeMenu();
      if (Platform.OS !== 'ios') {
        runPendingAction();
      }
    },
    [closeMenu, runPendingAction],
  );

  const reportLane = useCallback(
    (lane: CircleLane) => {
      if (!lane.taskId) return;
      if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Report' })) return;

      openReportTaskSheet({
        ownerName: lane.name,
        taskText: stripOuterQuotes(lane.latestUpdate?.text || goalText),
        onSubmit: (reason, details) =>
          new Promise<void>((resolve, reject) => {
            reportTask.mutate(
              { taskId: lane.taskId as string, reportedUserId: lane.userId, reason, details },
              {
                onSuccess: () => {
                  showToast({
                    type: 'success',
                    title: 'Report submitted',
                    message: 'Thanks. We will review this.',
                  });
                  resolve();
                },
                onError: (err: any) => {
                  const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
                  showToast({
                    type: 'error',
                    title: 'Report not sent',
                    message: apiMessage || 'Could not submit this report. Try again.',
                  });
                  reject(err);
                },
              },
            );
          }),
      });
    },
    [checkAuthThenNavigate, goalText, openReportTaskSheet, reportTask],
  );

  const blockLane = useCallback(
    (lane: CircleLane) => {
      if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Report' })) return;

      showConfirmAlert({
        title: `Block ${getFirstName(lane.name)}?`,
        message: 'You will no longer see their goals, and they will not see yours.',
        confirmText: 'Block',
        destructive: true,
        onConfirm: () =>
          blockUser.mutate(
            { userId: lane.userId },
            {
              onSuccess: () => {
                showToast({
                  type: 'success',
                  title: 'Blocked',
                  message: 'You will not see their content anymore.',
                });
                // Spec §10: blocking a circle-mate prompts the blocker once.
                if (isMember) {
                  Alert.alert(
                    'Leave this circle too?',
                    'The circle continues for the others either way.',
                    [
                      { text: 'Stay', style: 'cancel' },
                      { text: 'Leave circle', style: 'destructive', onPress: onLeave },
                    ],
                  );
                }
              },
              onError: () =>
                showToast({
                  type: 'error',
                  title: 'Could not block',
                  message: 'Please try again.',
                }),
            },
          ),
      });
    },
    [blockUser, checkAuthThenNavigate, isMember, onLeave],
  );

  // One member: act directly. Several: pick who first.
  const pickLaneThen = useCallback(
    (title: string, action: (lane: CircleLane) => void) => {
      if (otherLanes.length === 0) return;
      if (otherLanes.length === 1) {
        action(otherLanes[0]);
        return;
      }

      Alert.alert(title, undefined, [
        ...otherLanes.map(lane => ({
          text: lane.name,
          onPress: () => action(lane),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ]);
    },
    [otherLanes],
  );

  const openMenu = useCallback(() => {
    const showMenu = (anchor = menuAnchor) => {
      setMenuAnchor(anchor);
      setMenuVisible(true);
    };

    if (!triggerRef.current?.measureInWindow) {
      showMenu();
      return;
    }

    triggerRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
      showMenu({ x, y, width, height });
    });
  }, [menuAnchor]);

  const menuLeft = Math.min(
    Math.max(spacing.md, menuAnchor.x + menuAnchor.width - MENU_WIDTH),
    Math.max(spacing.md, windowWidth - MENU_WIDTH - spacing.md),
  );
  const menuTop = Math.max(spacing.md, menuAnchor.y + menuAnchor.height + vs(8));

  return (
    <View>
      <Pressable
        ref={triggerRef}
        hitSlop={8}
        onPress={openMenu}
        disabled={reportTask.isPending || blockUser.isPending}
        accessibilityRole="button"
        accessibilityLabel="Circle options"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Icon set="ion" name="ellipsis-vertical" size={ms(18)} color={colors.onboardingInk} />
      </Pressable>

      <AppModal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
        onDismiss={runPendingAction}
      >
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <Pressable style={[styles.menu, { left: menuLeft, top: menuTop }]}>
            {otherLanes.length > 0 ? (
              <>
                <MenuItem
                  icon="flag-outline"
                  label="Report a member"
                  onPress={() =>
                    closeMenuThenRun(() => pickLaneThen('Report a member', reportLane))
                  }
                />
                <MenuItem
                  icon="ban-outline"
                  label="Block a member"
                  destructive
                  onPress={() => closeMenuThenRun(() => pickLaneThen('Block a member', blockLane))}
                />
              </>
            ) : null}
            {isMember ? (
              <MenuItem
                icon="exit-outline"
                label="Leave circle"
                destructive
                onPress={() => closeMenuThenRun(onLeave)}
              />
            ) : null}
          </Pressable>
        </Pressable>
      </AppModal>
    </View>
  );
}

type MenuItemProps = {
  icon: string;
  label: string;
  destructive?: boolean;
  onPress: () => void;
};

function MenuItem({ icon, label, destructive = false, onPress }: MenuItemProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const itemColor = destructive ? colors.error : colors.onboardingInk;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
    >
      <Icon set="ion" name={icon} size={ms(16)} color={itemColor} />
      <TextElement variant="bodySmall" weight="600" style={{ color: itemColor }}>
        {label}
      </TextElement>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      width: ms(35),
      height: ms(35),
      borderRadius: ms(17.5),
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.7,
    },
    backdrop: {
      flex: 1,
    },
    menu: {
      position: 'absolute',
      width: MENU_WIDTH,
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: vs(6),
      ...platformShadow({
        color: '#000',
        opacity: 0.16,
        radius: 18,
        offset: { width: 0, height: 8 },
      }),
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(10),
      paddingVertical: vs(10),
      paddingHorizontal: spacing.md,
    },
    menuItemPressed: {
      backgroundColor: colors.onboardingPaper,
    },
  });
