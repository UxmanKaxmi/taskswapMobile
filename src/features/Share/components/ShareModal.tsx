import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Image, Platform, Pressable, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms, vs } from 'react-native-size-matters';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';

import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import TextElement from '@shared/components/TextElement/TextElement';
import { showToast } from '@shared/utils/toast';
import {
  getFirstName,
  stripOuterQuotes,
  timeAgo,
  toShortName,
} from '@shared/utils/helperFunctions';
import { Goal } from '@features/Home/types/home';
import { GoalType } from '@features/Goals/types/goals';
import { Icon } from '@shared/components/Icons';
import AppLogo from '@shared/components/AppLogo';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import AppModal from '@shared/components/AppModal/AppModal';
import { useAuth } from '@features/Auth/AuthProvider';

type Props = {
  task: Goal;
  visible: boolean;
  onClose: () => void;
  /**
   * Whether the current user owns this task. When provided it takes precedence
   * over deriving ownership from `task.userId`, which can be missing on a
   * freshly-created task (e.g. the post-create auto-share flow).
   */
  isOwner?: boolean;
};

const TYPE_LABELS: Record<GoalType, string> = {
  motivation: 'Motivation',
  advice: 'Advice',
  decision: 'Decision',
  reminder: 'Reminder',
};

const MODAL_SUBTITLES: Record<GoalType, string> = {
  motivation: 'Share it so friends can push you and keep you honest.',
  advice: 'Share it so friends can weigh in with advice you trust.',
  decision: 'Share it so friends can help you decide with confidence.',
  reminder: 'Share it so friends can keep you on time.',
};

const POSTER_SUBTITLES: Record<GoalType, string> = {
  motivation: 'Give me a push.',
  advice: 'What would you do?',
  decision: 'Help me make a decision?',
  reminder: 'Remind me when it’s time.',
};

const SHARE_BUTTON_LABELS: Record<GoalType, string> = {
  motivation: 'Share to get pushes',
  advice: 'Share to get advice',
  decision: 'Share to get help',
  reminder: 'Share reminder',
};

const SHARE_MESSAGE = (text: string, name?: string) =>
  `"${stripOuterQuotes(text)}" — ${toShortName(name) || 'PushMeUp'}`;

type ShareCopy = {
  modalTitle: string;
  modalSubtitle: string;
  posterTitle: string;
  posterSubtitle: string;
  buttonLabel: string;
};

function getSupporterUserIds(task: Goal) {
  const ids = new Set<string>();

  task.pushHistory?.forEach(push => {
    if (push.user?.id) ids.add(push.user.id);
  });

  return ids;
}

function buildShareCopy({
  task,
  typeLabel,
  currentUserId,
  isOwner,
}: {
  task: Goal;
  typeLabel: string;
  currentUserId?: string;
  isOwner: boolean;
}): ShareCopy {
  const taskType = task.type as GoalType;
  const ownerFirstName = getFirstName(task.name) || 'Someone';
  const isCompleted = Boolean(
    ('completed' in task && task.completed) || ('completedAt' in task && task.completedAt),
  );
  const supporterUserIds = getSupporterUserIds(task);
  const didCurrentUserHelp =
    !!currentUserId && (supporterUserIds.has(currentUserId) || Boolean(task.hasPushed));
  const supporterCount = Math.max(
    Array.from(supporterUserIds).filter(id => id !== task.userId).length,
    task.pushCount ?? 0,
  );

  if (isCompleted) {
    if (isOwner) {
      const supportLabel =
        supporterCount > 1
          ? `${supporterCount} people helped you finish.`
          : supporterCount === 1
            ? 'A friend helped you finish.'
            : 'You followed through.';

      return {
        modalTitle: 'Share your win',
        modalSubtitle:
          supporterCount > 0
            ? 'Share the win and the friends who pushed you to it.'
            : 'Share the win and mark the follow-through.',
        posterTitle: `I completed this ${typeLabel.toLowerCase()}`,
        posterSubtitle: supportLabel,
        buttonLabel: 'Share my win',
      };
    }

    if (didCurrentUserHelp) {
      return {
        modalTitle: `Share ${ownerFirstName}'s win`,
        modalSubtitle: `You pushed ${ownerFirstName} to the finish. Share the moment.`,
        posterTitle: `I helped ${ownerFirstName} complete this`,
        posterSubtitle: 'A small push made a difference.',
        buttonLabel: 'Share the win',
      };
    }

    return {
      modalTitle: `Share ${ownerFirstName}'s win`,
      modalSubtitle: `${ownerFirstName} followed through. Share the result.`,
      posterTitle: `${ownerFirstName} completed this`,
      posterSubtitle: 'A task moved from posted to done.',
      buttonLabel: 'Share their win',
    };
  }

  if (isOwner) {
    return {
      modalTitle: 'Share your task',
      modalSubtitle: MODAL_SUBTITLES[taskType] ?? 'Share it so friends can keep you on track.',
      posterTitle: `My ${typeLabel}`,
      posterSubtitle: POSTER_SUBTITLES[taskType] ?? 'Keep me on track.',
      buttonLabel: SHARE_BUTTON_LABELS[taskType] ?? 'Share',
    };
  }

  return {
    modalTitle:
      taskType === 'motivation' ? `Help ${ownerFirstName} get pushed` : `Help ${ownerFirstName}`,
    modalSubtitle:
      taskType === 'motivation'
        ? `Share this so more people can push ${ownerFirstName} forward.`
        : `Share this so more people can help ${ownerFirstName}.`,
    posterTitle: `${ownerFirstName}'s ${typeLabel}`,
    posterSubtitle:
      taskType === 'motivation'
        ? `${ownerFirstName} could use a push.`
        : (POSTER_SUBTITLES[taskType] ?? 'Help keep this on track.'),
    buttonLabel:
      taskType === 'motivation'
        ? `Share ${ownerFirstName}'s request`
        : (SHARE_BUTTON_LABELS[taskType] ?? 'Share'),
  };
}

function pushCountLabel(count: number) {
  return `${count} ${count === 1 ? 'push' : 'pushes'}`;
}

// Give RN a beat so the hidden poster has rendered before capture
const waitForLayout = () => new Promise<void>(r => setTimeout(r, 80));

// Reusable preview card shown in the sheet and baked into the shared image
function SharePreviewCard({ task }: { task: Goal }) {
  const styles = useThemedStyles(createStyles);
  const pushCount = task.pushCount ?? 0;

  return (
    <View style={styles.previewCard}>
      <View style={styles.previewHeader}>
        <Image source={{ uri: task.avatar || '' }} style={styles.previewAvatar} />
        <View style={styles.previewHeaderText}>
          <TextElement style={styles.previewName}>{toShortName(task.name)}</TextElement>
          <TextElement style={styles.previewMeta} color="muted">
            on PushMeUp · {timeAgo(task.createdAt)}
          </TextElement>
        </View>
      </View>

      <TextElement style={styles.previewQuote} numberOfLines={3}>
        “{stripOuterQuotes(task.text)}”
      </TextElement>

      <View style={styles.previewFooter}>
        <AppLogo size="sm" align="left" />
        <TextElement style={styles.previewPushes} color="muted">
          {pushCountLabel(pushCount)}
        </TextElement>
      </View>
    </View>
  );
}

export default function ShareModal({ task, visible, onClose, isOwner }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [isSharing, setIsSharing] = useState(false);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // ✅ Capture ONLY the hidden share poster (off-screen)
  const posterShotRef = useRef<ViewShotRef | null>(null);

  const taskType = task.type as GoalType;
  const typeLabel = TYPE_LABELS[taskType] ?? 'Goal';
  // Prefer the caller-provided ownership flag; fall back to id comparison.
  const resolvedIsOwner = isOwner ?? (!!user?.id && task.userId === user.id);
  const shareCopy = useMemo(
    () => buildShareCopy({ task, typeLabel, currentUserId: user?.id, isOwner: resolvedIsOwner }),
    [task, typeLabel, user?.id, resolvedIsOwner],
  );

  const handleShare = useCallback(async () => {
    if (!posterShotRef.current) return;

    setIsSharing(true);
    try {
      // ensure poster is laid out
      await waitForLayout();

      const uri = await (posterShotRef.current as any).capture({
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      if (!uri) throw new Error('Unable to capture share preview');

      const normalizedUri =
        Platform.OS === 'android' && !uri.startsWith('file://') ? `file://${uri}` : uri;

      const result = await Share.share({
        url: normalizedUri,
        title: `${typeLabel} from PushMeUp`,
        message: SHARE_MESSAGE(task.text, task.name),
      });

      if (result.action === Share.sharedAction) {
        showToast({
          type: 'success',
          title: 'Shared!',
          message: 'Your card is heading out to friends.',
        });
        onClose();
      }
    } catch (error) {
      console.error('Failed to share task', error);
      showToast({
        type: 'error',
        title: 'Share failed',
        message: 'Something went wrong while preparing your card.',
      });
    } finally {
      setIsSharing(false);
    }
  }, [onClose, task.name, task.text, typeLabel]);

  return (
    <AppModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* =======================
          VISIBLE UI — full screen
         ======================= */}
      <View style={styles.root}>
        <View style={[styles.topBar, { paddingTop: insets.top + vs(6) }]}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={styles.closeButton}
            accessibilityLabel="Close"
          >
            <Icon set="ion" name="close" size={ms(22)} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Icon
              set="fa6"
              name="arrow-up-from-bracket"
              size={ms(28)}
              color={colors.onboardingInk}
              iconStyle="solid"
            />
          </View>

          <TextElement style={styles.title}>{shareCopy.modalTitle}</TextElement>
          <TextElement style={styles.subtitle} color="muted">
            {shareCopy.modalSubtitle}
          </TextElement>

          <SharePreviewCard task={task} />
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + vs(12) }]}>
          <PrimaryButton
            onPress={handleShare}
            title={shareCopy.buttonLabel}
            isLoading={isSharing}
            style={styles.shareButton}
            backgroundColor={colors.onboardingPush}
            textColor={colors.tactileMomentumSecondary}
            disabled={isSharing}
          />
          <TextElement style={styles.privacy} color="muted">
            Only what you see here will be shared.
          </TextElement>
        </View>
      </View>

      {/* =======================
          HIDDEN SHARE POSTER (captured)
          - off-screen
          - no CTA button / privacy line
         ======================= */}
      <View style={styles.hiddenPoster}>
        <ViewShot
          ref={posterShotRef}
          options={{ format: 'png', quality: 1, result: 'tmpfile' }}
          style={styles.posterRoot}
        >
          <View style={styles.posterSheet}>
            <View style={styles.iconCircle}>
              <Icon
                set="fa6"
                name="arrow-up-from-bracket"
                size={ms(28)}
                color={colors.onboardingInk}
                iconStyle="solid"
              />
            </View>

            <TextElement style={styles.title}>{shareCopy.posterTitle}</TextElement>
            <TextElement style={styles.subtitle} color="muted">
              {shareCopy.posterSubtitle}
            </TextElement>

            <SharePreviewCard task={task} />

            <TextElement style={styles.branding} color="muted">
              PushMeUp • pushmeup.app
            </TextElement>
          </View>
        </ViewShot>
      </View>

      {/* Optional: block taps / mask tiny visual glitches while share sheet opens */}
      {isSharing ? <View style={styles.blocker} /> : null}
    </AppModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.surface,
    },

    topBar: {
      paddingHorizontal: spacing.md,
      alignItems: 'flex-end',
    },

    closeButton: {
      width: ms(36),
      height: ms(36),
      borderRadius: ms(18),
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },

    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },

    iconCircle: {
      alignSelf: 'center',
      width: ms(96),
      height: ms(96),
      borderRadius: ms(48),
      backgroundColor: 'rgba(255, 210, 63, 0.18)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: vs(20),
    },

    title: {
      fontSize: ms(28),
      lineHeight: ms(38),
      fontWeight: '800',
      textAlign: 'center',
      color: colors.text,
      paddingHorizontal: spacing.sm,
    },

    subtitle: {
      fontSize: ms(15),
      lineHeight: ms(22),
      textAlign: 'center',
      marginTop: vs(8),
      marginBottom: vs(24),
      paddingHorizontal: spacing.md,
    },

    // ===== Preview card =====
    previewCard: {
      backgroundColor: '#EFEFEA',
      borderRadius: ms(20),
      padding: spacing.md,
    },

    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    previewAvatar: {
      width: ms(44),
      height: ms(44),
      borderRadius: ms(22),
      backgroundColor: colors.muted,
      marginRight: spacing.sm,
    },

    previewHeaderText: {
      flex: 1,
    },

    previewName: {
      fontSize: ms(16),
      fontWeight: '700',
      color: colors.text,
    },

    previewMeta: {
      fontSize: ms(13),
      marginTop: vs(2),
    },

    previewQuote: {
      fontSize: ms(16),
      lineHeight: ms(23),
      fontWeight: '700',
      color: colors.text,
      marginTop: vs(14),
    },

    previewFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: vs(18),
    },

    previewPushes: {
      fontSize: ms(13),
      fontWeight: '600',
    },

    // ===== Footer =====
    footer: {
      paddingHorizontal: spacing.lg,
    },

    shareButton: {
      borderRadius: ms(28),
    },

    privacy: {
      fontSize: ms(12),
      textAlign: 'center',
      opacity: 0.9,
      // marginTop: vs(12),
    },

    // ===== Hidden poster capture =====
    hiddenPoster: {
      position: 'absolute',
      left: -9999,
      top: -9999,
      opacity: 0,
    },

    posterRoot: {
      width: 390, // iPhone-ish width
      height: 844, // iPhone-ish height
      backgroundColor: colors.surface,
    },

    posterSheet: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },

    branding: {
      fontSize: ms(12),
      textAlign: 'center',
      opacity: 0.6,
      marginTop: vs(24),
    },

    blocker: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(255,255,255,0.01)',
    },
  });
