import React, { useCallback, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
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

const MENU_WIDTH = ms(210);

type Props = {
  taskId: string;
  ownerUserId?: string;
  ownerName?: string;
  taskText?: string;
  /** Icon tint; defaults to the onboarding ink. */
  color?: string;
  style?: StyleProp<ViewStyle>;
  /** Called after a report is submitted successfully (e.g. leave the detail screen). */
  onReported?: () => void;
  /** Called after the owner is blocked successfully. */
  onBlocked?: () => void;
};

/**
 * Report / Block menu for a goal, reachable directly from the content surface
 * (feed cards + detail). Renders nothing for the owner's own content.
 */
export default function GoalModerationMenu({
  taskId,
  ownerUserId,
  ownerName,
  taskText,
  color,
  style,
  onReported,
  onBlocked,
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
  const [menuAnchor, setMenuAnchor] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  // Actions that present something (e.g. the report bottom-sheet) must wait for
  // the menu Modal to finish dismissing — presenting mid-dismissal is silently
  // dropped on iOS. Modal.onDismiss is iOS-only, so Android runs them directly.
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

  const handleReport = useCallback(() => {
    if (!ownerUserId) return;
    if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Report' })) return;

    openReportTaskSheet({
      ownerName: ownerName ?? '',
      taskText: taskText ? stripOuterQuotes(taskText) : '',
      onSubmit: (reason, details) =>
        new Promise<void>((resolve, reject) => {
          reportTask.mutate(
            { taskId, reportedUserId: ownerUserId, reason, details },
            {
              onSuccess: () => {
                showToast({
                  type: 'success',
                  title: 'Report submitted',
                  message: 'Thanks. We will review this.',
                });
                resolve();
                onReported?.();
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
  }, [
    checkAuthThenNavigate,
    onReported,
    openReportTaskSheet,
    ownerName,
    ownerUserId,
    reportTask,
    taskId,
    taskText,
  ]);

  const handleBlock = useCallback(() => {
    if (!ownerUserId) return;
    if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Report' })) return;

    showConfirmAlert({
      title: `Block ${getFirstName(ownerName ?? 'this user')}?`,
      message: 'You will no longer see their goals, and they will not see yours.',
      confirmText: 'Block',
      destructive: true,
      onConfirm: () =>
        blockUser.mutate(
          { userId: ownerUserId },
          {
            onSuccess: () => {
              showToast({
                type: 'success',
                title: 'Blocked',
                message: 'You will not see their content anymore.',
              });
              onBlocked?.();
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
  }, [blockUser, checkAuthThenNavigate, onBlocked, ownerName, ownerUserId]);

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

  const handleReportOption = useCallback(() => {
    closeMenuThenRun(handleReport);
  }, [closeMenuThenRun, handleReport]);

  const handleBlockOption = useCallback(() => {
    closeMenuThenRun(handleBlock);
  }, [closeMenuThenRun, handleBlock]);

  // Owners can't report/block their own content.
  if (!ownerUserId || ownerUserId === user?.id) return null;

  const menuLeft = Math.min(
    Math.max(spacing.md, menuAnchor.x + menuAnchor.width - MENU_WIDTH),
    Math.max(spacing.md, windowWidth - MENU_WIDTH - spacing.md),
  );
  const menuTop = Math.max(spacing.md, menuAnchor.y + menuAnchor.height + vs(8));

  return (
    <View style={style}>
      <Pressable
        ref={triggerRef}
        hitSlop={8}
        onPress={openMenu}
        disabled={reportTask.isPending || blockUser.isPending}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Icon
          set="ion"
          name="ellipsis-vertical"
          size={ms(18)}
          color={color ?? colors.onboardingInk}
        />
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
            <ModerationMenuItem
              icon="flag-outline"
              label="Report task"
              onPress={handleReportOption}
            />
            <ModerationMenuItem
              icon="ban-outline"
              label="Block user"
              destructive
              onPress={handleBlockOption}
            />
          </Pressable>
        </Pressable>
      </AppModal>
    </View>
  );
}

type ModerationMenuItemProps = {
  icon: string;
  label: string;
  destructive?: boolean;
  onPress: () => void;
};

function ModerationMenuItem({
  icon,
  label,
  destructive = false,
  onPress,
}: ModerationMenuItemProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const itemColor = destructive ? colors.error : colors.onboardingInk;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
    >
      <Icon set="ion" name={icon} size={ms(17)} color={itemColor} />
      <TextElement style={[styles.menuItemText, { color: itemColor }]}>{label}</TextElement>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      minWidth: ms(32),
      minHeight: ms(32),
      borderRadius: ms(16),
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.55,
    },
    backdrop: {
      flex: 1,
    },
    menu: {
      position: 'absolute',
      width: MENU_WIDTH,
      borderRadius: ms(14),
      paddingVertical: vs(6),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      ...platformShadow({
        color: '#000',
        opacity: 0.16,
        radius: 18,
        offset: { width: 0, height: 10 },
      }),
    },
    menuItem: {
      minHeight: vs(44),
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuItemPressed: {
      backgroundColor: colors.onboardingPaper,
    },
    menuItemText: {
      marginLeft: ms(10),
      fontSize: ms(15),
      fontWeight: '700',
    },
  });
