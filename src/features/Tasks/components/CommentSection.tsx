// src/features/tasks/components/CommentsSection.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  findNodeHandle,
  UIManager,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
  ScrollView,
} from 'react-native';

import TextElement from '@shared/components/TextElement/TextElement';
import { ms } from 'react-native-size-matters';
import { colors, spacing } from '@shared/theme';
import Row from '@shared/components/Layout/Row';
import Avatar from '@shared/components/Avatar/Avatar';
import { timeAgo } from '@shared/utils/helperFunctions';
import Icon from '@shared/components/Icons/Icon';
import { TaskComment } from '../types/tasks';

type Friend = { id: string; name: string; photo?: string };

type Props = {
  comments: TaskComment[];
  onToggleLike?: (commentId: string, nextLike: boolean) => void;
  onPressCommentUser?: (comment: TaskComment) => void;
  onPressMentionUser?: (friend: Friend) => void;
  friends?: Friend[];
  highlightId?: string;
  /** pass parent ScrollView ref so we can scroll */
  scrollRef?: React.RefObject<ScrollView | null>;
};

export default function CommentsSection({
  comments = [], // 👈 default empty array
  onPressCommentUser,
  onPressMentionUser,
  onToggleLike,
  friends = [],
  highlightId,
  scrollRef,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const commentYMapRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (highlightId) setExpanded(true);
  }, [highlightId]);

  const data = useMemo(
    () => (expanded || highlightId ? comments : comments.slice(0, 3)),
    [comments, expanded, highlightId],
  );

  // flash anim per id
  const flashMap = useRef<Record<string, Animated.Value>>({});
  const ensure = (id: string) => (flashMap.current[id] ??= new Animated.Value(0));
  const bgFor = (id: string) =>
    ensure(id).interpolate({ inputRange: [0, 1], outputRange: ['transparent', '#FFF1A8'] });

  // flash when highlightId changes
  useEffect(() => {
    if (!highlightId) return;
    const v = ensure(highlightId);
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(v, { toValue: 0, duration: 800, useNativeDriver: false }),
    ]).start();

    // also scroll into view
    const y = commentYMapRef.current[highlightId];
    if (y != null && scrollRef?.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 100), animated: true });
    }
  }, [highlightId]);

  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const mentionRegex =
    friends.length > 0
      ? new RegExp(`(${friends.map(f => '@' + esc(f.name)).join('|')})`, 'g')
      : null;

  // Build a fast lookup map once
  const friendMap = useMemo(() => {
    const map: Record<string, Friend> = {};
    for (const f of friends) {
      map['@' + f.name] = f;
    }
    return map;
  }, [friends]);

  const renderText = (text: string) => {
    if (!mentionRegex) {
      return <TextElement variant="body">{text}</TextElement>;
    }

    const parts = text.split(mentionRegex);

    return parts.map((part, i) => {
      const friend = friendMap[part];
      if (friend) {
        return (
          <TextElement
            key={i}
            color="primary"
            weight="600"
            onPress={() => onPressMentionUser?.(friend)}
          >
            {part}
          </TextElement>
        );
      }
      return (
        <TextElement key={i} variant="body">
          {part}
        </TextElement>
      );
    });
  };

  const handleLayout = (id: string, ref: View | null) => {
    if (!ref || !scrollRef?.current) return;
    const scrollHandle = findNodeHandle(scrollRef.current);
    const nodeHandle = findNodeHandle(ref);
    if (!scrollHandle || !nodeHandle) return;

    UIManager.measureLayout(
      nodeHandle,
      scrollHandle,
      () => {},
      (_x, y) => {
        commentYMapRef.current[id] = y;
      },
    );
  };

  return (
    <View style={styles.wrapper}>
      <TextElement weight="600" variant="subtitle" style={styles.heading}>
        Comments ({comments.length})
      </TextElement>

      {data.map(item => (
        <Animated.View
          key={item.id}
          ref={ref => handleLayout(item.id, ref)}
          style={[styles.commentRow, { backgroundColor: bgFor(item.id) as any }]}
          // onLayout={e => handleLayout(item.id, e)}
        >
          <Row align="flex-start">
            <TouchableOpacity onPress={() => onPressCommentUser?.(item)}>
              <Avatar uri={item.user.photo} size={30} />
            </TouchableOpacity>

            <View style={styles.textWrapper}>
              <TextElement>
                <TextElement weight="600">{item.user.name} </TextElement>
                {renderText(item.text)}
              </TextElement>

              <Row justify="space-between" align="center" style={styles.metaRow}>
                <TextElement variant="caption" weight="300" color="muted" style={styles.time}>
                  {timeAgo(item.createdAt)}
                </TextElement>

                <TouchableOpacity
                  style={styles.likeBtn}
                  onPress={() => onToggleLike?.(item.id, !item.likedByMe)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon
                    name={item.likedByMe ? 'heart' : 'heart-outline'}
                    set="ion"
                    size={ms(16)}
                    color={item.likedByMe ? colors.error : colors.muted}
                  />
                  {item.likesCount > 0 && (
                    <TextElement variant="caption" color={item.likedByMe ? 'error' : 'muted'}>
                      {' '}
                      {item.likesCount}
                    </TextElement>
                  )}
                </TouchableOpacity>
              </Row>
            </View>
          </Row>
        </Animated.View>
      ))}

      {comments.length > 3 && !expanded && (
        <TouchableOpacity onPress={() => setExpanded(true)}>
          <TextElement variant="caption" color="primary" style={styles.viewMore}>
            View all {comments.length} comments
          </TextElement>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: spacing.md },
  heading: { marginBottom: spacing.sm },
  commentRow: {
    marginBottom: spacing.xs,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  textWrapper: { flex: 1, marginLeft: spacing.sm },
  metaRow: {},
  time: { fontSize: ms(12) },
  likeBtn: { flexDirection: 'row', alignItems: 'center' },
  viewMore: { marginTop: spacing.xs },
});
