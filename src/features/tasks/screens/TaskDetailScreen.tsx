// src/features/tasks/screens/TaskDetailScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  TextInput,
  Keyboard,
  ScrollView,
  Task,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from 'navigation/navigation';
import { useTheme } from '@shared/theme/useTheme';
import TextElement from '@shared/components/TextElement/TextElement';
import { Layout } from '@shared/components/Layout';
import Row from '@shared/components/Layout/Row';
import ReminderNoteList from '../components/ReminderNoteList';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import { formatReminderTime, timeAgo } from '@shared/utils/helperFunctions';
import { cardStyles } from '@features/Home/components/styles';
import Avatar from '@shared/components/Avatar/Avatar';
import TypeTag from '@shared/components/TypeTag/TypeTag';
import { Height } from '@shared/components/Spacing';
import { getTypeVisual } from '@shared/utils/typeVisuals';
import Column from '@shared/components/Layout/Column';
import HelpersRow from '../components/HelpersRow';
import { ms } from 'react-native-size-matters';
import CompletionStatus from '../components/CompletionStatus';
import { useAuth } from '@features/Auth/AuthProvider';
import { showToast } from '@shared/utils/toast';
import { useCompleteTask } from '@features/Home/hooks/useCompleteTask';
import { queryClient } from '@lib/react-query/client';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { openFriendsProfile } from '@navigation/navigationUtils';
import { colors, spacing } from '@shared/theme';
import StackedVoteBar from '../components/StackedVoteBar';
import AppLoader from '@shared/components/Loader/Loader';
import { useInCompleteTask } from '@features/Home/hooks/useInCompleteTask';
import { useCastVote } from '@features/Tasks/hooks/useVote';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTaskByIdAPI } from '@features/Home/api/api';
import CommentsSection from '../components/CommentSection';
import Icon from '@shared/components/Icons/Icon';
import { useAddComment, useToggleCommentLike } from '../hooks/useComment';
import { useFollowers } from '@features/User/hooks/useFollowers';
import { useFollowing } from '@features/User/hooks/useFollowing';
import { parseISO, formatDistanceToNow } from 'date-fns';
import { fetchComments } from '../api/commentApi';
import { useVoteStats } from '@features/Home/hooks/useVoteStats';
import { isAndroid } from '@shared/utils/constants';

export default function TaskDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'TaskDetail'>) {
  const { task: initialTask, taskId: taskIdParam, highlightCommentId } = route.params ?? {};
  const taskId = initialTask?.id ?? taskIdParam ?? '';

  const scrollRef = useRef<ScrollView>(null);
  const theme = useTheme();
  const { user } = useAuth();

  const [newComment, setNewComment] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionList, setShowMentionList] = useState(false);

  const { data: followers = [] } = useFollowers();
  const { data: following = [] } = useFollowing();

  const qc = useQueryClient();
  const tasks = qc.getQueryData<any[]>(buildQueryKey.tasks());

  const { data: comments = [] } = useQuery({
    queryKey: buildQueryKey.commentsForTask(taskId),
    queryFn: () => fetchComments(taskId),
    enabled: !!taskId,
  });

  const task = tasks?.find(t => t.id === taskId) ?? initialTask;

  // friends for @mentions
  const friendsMap = new Map<string, { id: string; name: string; photo?: string }>();
  [...followers, ...following].forEach(f =>
    friendsMap.set(f.id, { id: f.id, name: f.name, photo: f.photo }),
  );
  const friendsList = Array.from(friendsMap.values());

  const handleSelectMention = (friend: { id: string; name: string }) => {
    const words = newComment.split(/\s/);
    words[words.length - 1] = `@${friend.name}`;
    setNewComment(words.join(' ') + ' ');
    setMentionQuery('');
    setShowMentionList(false);
  };

  const handleChangeComment = (text: string) => {
    setNewComment(text);
    const lastWord = text.split(/\s/).slice(-1)[0] || '';
    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1));
      setShowMentionList(true);
    } else {
      setMentionQuery('');
      setShowMentionList(false);
    }
  };

  const emoji = task ? getTypeVisual(task.type).emoji : '';
  const isOwner = !!task && task.userId === user?.id;

  const [isCompleted, setCompleted] = useState<boolean>(!!task?.completed);
  useEffect(() => setCompleted(!!task?.completed), [task?.completed]);

  const voteMutation = useCastVote(taskId);
  const { mutate: completeTask } = useCompleteTask();
  const { mutate: incompleteTask } = useInCompleteTask();

  const addComment = useAddComment(taskId);
  const toggleLike = useToggleCommentLike(taskId);

  const { option1, option2, percent1, percent2, vote1, vote2, totalVotes } = useVoteStats(task);

  const commentYMapRef = useRef<Record<string, number>>({});
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(highlightCommentId ?? null);

  const extractMentions = (text: string) =>
    friendsList.filter(f => text.includes(`@${f.name}`)).map(f => f.id);

  useEffect(() => {
    if (!pendingScrollId) return;
    const y = commentYMapRef.current[pendingScrollId];
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 100), animated: true });
      setPendingScrollId(null);
    }
  }, [comments, pendingScrollId]);

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    });
    return () => sub.remove();
  }, []);

  const stillLoading = !task; // no flicker on refetch
  return (
    <Layout
      allowPadding
      useSafeArea={isAndroid ? false : true}
      footerContent={
        <View style={{ flexDirection: 'column' }}>
          {showMentionList && mentionQuery.length > 0 && (
            <View style={styles.suggestionBox}>
              {friendsList.map(friend => (
                <Pressable
                  key={friend.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectMention(friend)}
                >
                  <Avatar uri={friend.photo} size={28} />
                  <TextElement style={{ marginLeft: 8 }} weight="500">
                    {friend.name}
                  </TextElement>
                </Pressable>
              ))}
            </View>
          )}
          <Row align="center">
            <TextInput
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={handleChangeComment}
              style={styles.textInput}
              placeholderTextColor={colors.muted}
            />
            <Pressable
              disabled={!task || !newComment.trim() || addComment.isPending}
              onPress={() => {
                if (!task || !newComment.trim()) return;
                const mentionedIds = extractMentions(newComment);
                addComment.mutate(
                  { text: newComment, mentions: mentionedIds },
                  {
                    onSuccess: () => {
                      setNewComment('');
                      showToast({
                        type: 'success',
                        title: 'Comment Added',
                        message: 'Your comment has been posted!',
                      });
                    },
                    onError: () =>
                      showToast({
                        type: 'error',
                        title: 'Failed',
                        message: 'Could not post comment. Try again!',
                      }),
                  },
                );
              }}
              hitSlop={10}
              style={{ padding: 8 }}
            >
              <Icon name="send" set="ion" size={20} color={theme.colors.primary} />
            </Pressable>
          </Row>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} ref={scrollRef}>
        {stillLoading ? (
          <AppLoader visible />
        ) : (
          <>
            <AppHeader
              title="Task Details"
              right={
                isOwner ? (
                  <Pressable onPress={() => {}} hitSlop={10} style={{ paddingHorizontal: 4 }}>
                    <Icon set="ion" name="ellipsis-vertical" size={20} color={theme.colors.text} />
                  </Pressable>
                ) : null
              }
            />

            <Row justify="space-between" style={cardStyles.cardHeader}>
              <Pressable onPress={() => {}}>
                <Row>
                  <Avatar uri={task.avatar} />
                  <View>
                    <TextElement variant="subtitle" style={cardStyles.name}>
                      {task.name}
                    </TextElement>
                    <TextElement variant="caption" style={cardStyles.timeAgo} color="muted">
                      {timeAgo(task.createdAt)}
                    </TextElement>
                  </View>
                </Row>
              </Pressable>
              <TypeTag type={task.type} />
            </Row>

            <View style={cardStyles.messageRow}>
              <TextElement variant="title">
                {emoji} {task.text}
              </TextElement>
            </View>

            {task.type === 'reminder' && (
              <>
                <Height size={12} />
                <TextElement variant="caption" style={styles.reminderTimeKey}>
                  Reminder Time
                </TextElement>
                <TextElement variant="subtitle" weight="500" style={styles.reminderTimeValue}>
                  {task.remindAt ? formatReminderTime(task.remindAt) : 'No reminder set'}
                </TextElement>
                <TextElement color="muted" variant="subtitle" style={styles.detailFromNow}>
                  ⏳{' '}
                  {task.remindAt &&
                    formatDistanceToNow(parseISO(task.remindAt), { addSuffix: true })}
                </TextElement>
              </>
            )}

            <Height size={12} />

            {task.type === 'decision' && task.options?.length === 2 && (
              <StackedVoteBar
                option1={option1}
                option2={option2}
                percent1={percent1}
                percent2={percent2}
                vote1={vote1}
                vote2={vote2}
                voters1={task.votes?.[option1]?.preview ?? []}
                voters2={task.votes?.[option2]?.preview ?? []}
                votedOption={task.votedOption}
                canChange
                isSubmitting={voteMutation.isPending}
                onChangeVote={next => {
                  if (!user?.id) return;
                  voteMutation.mutate({
                    nextOption: next,
                    prevOption: task.votedOption,
                    me: { id: user.id, name: user.name, photo: user.photo || '' },
                  });
                }}
              />
            )}

            {task.helpers && task.helpers.length > 0 && (
              <View>
                <TextElement variant="caption" weight="500" style={styles.reminderTimeKey}>
                  Helpers
                </TextElement>
                <HelpersRow
                  maxVisible={3}
                  helpers={task.helpers as any}
                  onPressAvatar={helper => openFriendsProfile(navigation, helper.id)}
                />
              </View>
            )}

            <Height size={12} />

            <Row justify="space-between">
              <Column gap={-1} style={{ marginEnd: 10 }}>
                <TextElement variant="caption" weight="500" style={styles.reminderTimeKey}>
                  Status
                </TextElement>
                <CompletionStatus completed={task.completed} />
              </Column>
            </Row>

            {!isOwner && task.completed && (
              <View style={{ marginTop: spacing.md }}>
                <TextElement variant="caption" weight="500" style={styles.reminderTimeKey}>
                  Task marked completed at
                </TextElement>
                <TextElement variant="subtitle" weight="600" style={styles.reminderTimeValue}>
                  {task.completedAt ? formatReminderTime(task.completedAt) : 'Date not available'}
                </TextElement>
              </View>
            )}

            <Height size={25} />

            {task.type === 'reminder' && (
              <>
                <TextElement variant="subtitle" weight="500">
                  Friendly Reminders
                </TextElement>
                <ReminderNoteList
                  onPressFriendProfile={friendId => openFriendsProfile(navigation, friendId)}
                  taskId={task.id}
                />
              </>
            )}

            <CommentsSection
              comments={comments ?? []} // 👈 ensures always array
              friends={friendsList}
              onPressCommentUser={comment => openFriendsProfile(navigation, comment.user.id)}
              onPressMentionUser={friend => openFriendsProfile(navigation, friend.id)}
              highlightId={highlightCommentId}
              scrollRef={scrollRef} // 👈 pass down
              onToggleLike={(commentId, nextLike) => {
                toggleLike.mutate({ commentId, like: nextLike });
              }}
            />
          </>
        )}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  suggestionBox: {},
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  reminderTimeKey: { fontSize: ms(12), color: colors.muted },
  detailFromNow: { fontSize: ms(11) },
  reminderTimeValue: { fontSize: ms(16) },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 24, android: 16 }),
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 12,
  },
  textInput: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    marginRight: 8,
  },
});
