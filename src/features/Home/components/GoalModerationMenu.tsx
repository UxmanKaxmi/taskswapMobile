import React, { useCallback } from 'react';
import { Alert, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ms } from 'react-native-size-matters';

import Ripple from '@shared/components/Buttons/Ripple';
import Icon from '@shared/components/Icons/Icon';
import { useTheme } from '@shared/theme';
import { useAuth } from '@features/Auth/AuthProvider';
import { useModal } from '@shared/components/ModalProvider';
import { useReportTask } from '@features/Reports/hooks/useReportTask';
import { useBlockUser } from '@features/Reports/hooks/useBlockUser';
import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import { showToast } from '@shared/utils/toast';
import { showConfirmAlert } from '@shared/utils/confirmAlert';
import { getFirstName, stripOuterQuotes } from '@shared/utils/helperFunctions';

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
  const { colors } = useTheme();
  const { user } = useAuth();
  const { openReportTaskSheet } = useModal();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const reportTask = useReportTask();
  const blockUser = useBlockUser();

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
    Alert.alert('Goal options', undefined, [
      { text: 'Report goal', onPress: handleReport },
      { text: 'Block user', style: 'destructive', onPress: handleBlock },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [handleReport, handleBlock]);

  // Owners can't report/block their own content.
  if (!ownerUserId || ownerUserId === user?.id) return null;

  return (
    <View style={style}>
      <Ripple hitSlop={8} onPress={openMenu} style={styles.button}>
        <Icon
          set="ion"
          name="ellipsis-horizontal"
          size={ms(18)}
          color={color ?? colors.onboardingInk}
        />
      </Ripple>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: ms(4),
  },
});
