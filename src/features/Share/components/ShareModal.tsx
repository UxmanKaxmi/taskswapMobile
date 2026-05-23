import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';
import ViewShot from 'react-native-view-shot';

import { spacing } from '@shared/theme';
import TextElement from '@shared/components/TextElement/TextElement';
import { showToast } from '@shared/utils/toast';
import { getFirstName, stripOuterQuotes, toShortName } from '@shared/utils/helperFunctions';
import { Task } from '@features/Home/types/home';
import TaskHeader from '@features/Home/components/TaskHeader';
import TaskCardGradient from '@features/Home/components/TaskCardGradient';
import { TaskType, TaskTypeEnum } from '@features/Tasks/types/tasks';
import { cardStyles } from '@features/Home/components/styles';
import { getTypeColor, typeIcons } from '@shared/utils/typeVisuals';
import { Icon } from '@shared/components/Icons';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import AppModal from '@shared/components/AppModal/AppModal';
import { useAuth } from '@features/Auth/AuthProvider';

type Props = {
  task: Task;
  visible: boolean;
  onClose: () => void;
};

const TYPE_LABELS: Record<TaskType, string> = {
  motivation: 'Motivation',
  advice: 'Advice',
  decision: 'Decision',
  reminder: 'Reminder',
};

const MODAL_SUBTITLES: Record<TaskType, string> = {
  motivation: 'Share this so friends can push you and keep you accountable.',
  advice: 'Share this so friends can reply with advice you actually trust.',
  decision: 'Share this so friends can help you choose with confidence.',
  reminder: 'Share this so friends can remind you when it matters most.',
};

const POSTER_SUBTITLES: Record<TaskType, string> = {
  motivation: 'Give me a push.',
  advice: 'What would you do?',
  decision: 'Help me make a decision?',
  reminder: 'Remind me when it’s time.',
};

const SHARE_BUTTON_LABELS: Record<TaskType, string> = {
  motivation: 'Share for support',
  advice: 'Ask for advice',
  decision: 'Ask for help',
  reminder: 'Share reminder',
};

const SHARE_MESSAGE = (text: string, name?: string) =>
  `"${stripOuterQuotes(text)}" — ${toShortName(name) || 'TaskSwap'}`;

type ShareCopy = {
  modalTitle: string;
  modalSubtitle: string;
  posterTitle: string;
  posterSubtitle: string;
  buttonLabel: string;
};

function getSupporterUserIds(task: Task) {
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
}: {
  task: Task;
  typeLabel: string;
  currentUserId?: string;
}): ShareCopy {
  const taskType = task.type as TaskType;
  const ownerFirstName = getFirstName(task.name) || 'Someone';
  const isOwner = !!currentUserId && task.userId === currentUserId;
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
        modalTitle: 'Share Your Win',
        modalSubtitle:
          supporterCount > 0
            ? 'Share the completed task and the support behind it.'
            : 'Share the completed task and mark the follow-through.',
        posterTitle: `I completed this ${typeLabel.toLowerCase()}`,
        posterSubtitle: supportLabel,
        buttonLabel: 'Share my win',
      };
    }

    if (didCurrentUserHelp) {
      return {
        modalTitle: `Share ${ownerFirstName}'s Win`,
        modalSubtitle: `You helped ${ownerFirstName} complete this. Share the moment.`,
        posterTitle: `I helped ${ownerFirstName} complete this`,
        posterSubtitle: 'A small push made a difference.',
        buttonLabel: 'Share the win',
      };
    }

    return {
      modalTitle: `Share ${ownerFirstName}'s Win`,
      modalSubtitle: `${ownerFirstName} completed this. Share the result.`,
      posterTitle: `${ownerFirstName} completed this`,
      posterSubtitle: 'A task moved from posted to done.',
      buttonLabel: 'Share their win',
    };
  }

  if (isOwner) {
    return {
      modalTitle: `Share Your ${typeLabel}`,
      modalSubtitle: MODAL_SUBTITLES[taskType] ?? 'Share this card with your friends.',
      posterTitle: `My ${typeLabel}`,
      posterSubtitle: POSTER_SUBTITLES[taskType] ?? 'Keep me on track.',
      buttonLabel: SHARE_BUTTON_LABELS[taskType] ?? 'Share',
    };
  }

  return {
    modalTitle: `Share ${ownerFirstName}'s ${typeLabel}`,
    modalSubtitle:
      taskType === 'motivation'
        ? `Share this so friends can help ${ownerFirstName} follow through.`
        : `Share this so friends can help ${ownerFirstName}.`,
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

// Give RN a beat so the hidden poster has rendered before capture
const waitForLayout = () => new Promise<void>(r => setTimeout(r, 80));

export default function ShareModal({ task, visible, onClose }: Props) {
  const [isSharing, setIsSharing] = useState(false);
  const { user } = useAuth();

  // ✅ Capture ONLY the hidden share poster (off-screen)
  const posterShotRef = useRef<InstanceType<typeof ViewShot> | null>(null);

  const taskType = task.type as TaskType;
  const iconName = typeIcons[taskType];
  const typeColor = getTypeColor(taskType);
  const typeLabel = TYPE_LABELS[taskType] ?? 'Task';
  const shareCopy = useMemo(
    () => buildShareCopy({ task, typeLabel, currentUserId: user?.id }),
    [task, typeLabel, user?.id],
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
        title: `${typeLabel} from TaskSwap`,
        message: SHARE_MESSAGE(task.text, task.name),
      });

      if (result.action === Share.sharedAction) {
        showToast({
          type: 'success',
          title: 'Shared!',
          message: 'Your card is heading to socials.',
        });
        onClose();
      }
    } catch (error) {
      console.error('Failed to share motivation', error);
      showToast({
        type: 'error',
        title: 'Share failed',
        message: 'Something went wrong while preparing your card.',
      });
    } finally {
      setIsSharing(false);
    }
  }, [onClose, task.name, task.text]);

  return (
    <AppModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* =======================
          VISIBLE UI (no swapping)
         ======================= */}
      <TaskCardGradient type={taskType} style={styles.cardGradient}>
        {/* tap outside */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.badgeWrap}>
            <View style={styles.badge}>
              <Icon set="fa6" name={iconName} size={ms(25)} color={typeColor} iconStyle="solid" />
            </View>
          </View>

          <TextElement style={styles.title}>{shareCopy.modalTitle}</TextElement>
          <TextElement style={styles.body} color="muted">
            {shareCopy.modalSubtitle}
          </TextElement>

          <View style={styles.previewWrap}>
            <View style={styles.cardShadow}>
              <TaskCardGradient type={taskType} style={styles.cardGradient}>
                <View style={styles.cardContent}>
                  <TaskHeader
                    avatar={task.avatar || ''}
                    name={task.name}
                    createdAt={task.createdAt}
                    type={taskType as TaskTypeEnum}
                    helpers={task.helpers ?? []}
                  />
                  <View style={cardStyles.messageRow}>
                    <TextElement variant="title" style={styles.mainText}>
                      "{stripOuterQuotes(task.text)}"
                    </TextElement>
                  </View>
                </View>
              </TaskCardGradient>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            onPress={handleShare}
            title={shareCopy.buttonLabel}
            isLoading={isSharing}
            style={[styles.shareButton, { backgroundColor: typeColor }]}
            disabled={isSharing}
          />
          <TextElement style={styles.privacy} color="muted">
            Only what you see here will be shared.
          </TextElement>
        </View>
      </TaskCardGradient>

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
          <TaskCardGradient type={taskType} style={styles.cardGradient}>
            <View style={styles.posterSheet}>
              <View style={styles.badgeWrapPoster}>
                <View style={styles.badge}>
                  <Icon
                    set="fa6"
                    name={iconName}
                    size={ms(25)}
                    color={typeColor}
                    iconStyle="solid"
                  />
                </View>
              </View>

              <TextElement style={styles.title}>{shareCopy.posterTitle}</TextElement>
              <TextElement style={styles.posterSubtitle} color="muted">
                {shareCopy.posterSubtitle}
              </TextElement>

              <View style={styles.previewWrap}>
                <View style={styles.cardShadow}>
                  <TaskCardGradient type={taskType} style={styles.cardGradient}>
                    <View style={styles.cardContent}>
                      <TaskHeader
                        avatar={task.avatar || ''}
                        name={task.name}
                        createdAt={task.createdAt}
                        type={taskType as TaskTypeEnum}
                        helpers={task.helpers ?? []}
                      />
                      <View style={cardStyles.messageRow}>
                        <TextElement variant="title" style={styles.mainText}>
                          "{stripOuterQuotes(task.text)}"
                        </TextElement>
                      </View>
                    </View>
                  </TaskCardGradient>
                </View>
              </View>

              <TextElement style={styles.branding} color="muted">
                Push Me Up • pushmeup.app
              </TextElement>
            </View>
          </TaskCardGradient>
        </ViewShot>
      </View>

      {/* Optional: block taps / mask tiny visual glitches while share sheet opens */}
      {isSharing ? <View style={styles.blocker} /> : null}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  mainText: {
    // marginBottom: vs(8),
    fontSize: ms(21),
    lineHeight: ms(30),
    fontWeight: '600',
  },
  sheet: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    top: vs(200),
    backgroundColor: '#FFF',
    borderRadius: ms(28),
    padding: spacing.lg,
    paddingBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },

  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },

  badgeWrap: {
    position: 'absolute',
    top: -vs(30),
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  badge: {
    width: ms(58),
    height: ms(58),
    borderRadius: ms(18),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  title: {
    fontSize: ms(20),
    fontWeight: '700',
    textAlign: 'center',
    marginTop: vs(10),
  },

  body: {
    fontSize: ms(13),
    lineHeight: ms(18),
    textAlign: 'center',
    marginTop: vs(6),
    marginBottom: vs(14),
  },

  previewWrap: {
    borderRadius: ms(24),
    overflow: 'hidden',
    marginBottom: spacing.md,
  },

  cardShadow: {
    borderRadius: ms(24),
    overflow: 'hidden',
  },

  cardGradient: {
    borderRadius: ms(24),
    overflow: 'hidden',
  },

  cardContent: { padding: spacing.md },

  privacy: {
    fontSize: ms(11),
    textAlign: 'center',
    opacity: 0.9,
    marginTop: -spacing.xs,
  },

  shareButton: {
    marginTop: spacing.xs,
  },

  // ===== Hidden poster capture =====
  hiddenPoster: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    opacity: 0,
  },

  // Give poster a deterministic size (helps ViewShot output)
  posterRoot: {
    width: 390, // iPhone-ish width
    height: 844, // iPhone-ish height
  },

  posterSheet: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    top: vs(200),
    backgroundColor: '#FFF',
    borderRadius: ms(28),
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },

  badgeWrapPoster: {
    position: 'absolute',
    top: -vs(30),
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  posterSubtitle: {
    fontSize: ms(13),
    textAlign: 'center',
    marginTop: vs(6),
    marginBottom: vs(14),
    opacity: 0.8,
  },

  branding: {
    fontSize: ms(11),
    textAlign: 'center',
    opacity: 0.6,
    marginTop: vs(0),
  },

  blocker: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
});
