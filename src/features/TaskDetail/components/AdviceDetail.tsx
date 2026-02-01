// src/features/tasks/components/body/AdviceDetail.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, colors } from '@shared/theme';
import Avatar from '@shared/components/Avatar/Avatar';
import { timeAgo } from '@shared/utils/helperFunctions';
import { MOCK_ADVICE } from '@shared/utils/mock';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import { Height } from '@shared/components/Spacing';
import { Shadow } from '@shared/components/Shadow';
import ListView from '@shared/components/ListView/ListView';
import EmptyState from '@features/Empty/EmptyState';
import Row from '@shared/components/Layout/Row';
import { ms, vs } from 'react-native-size-matters';
import { Icon } from '@shared/components/Icons';
import { useComments, useToggleCommentLike } from '@features/Tasks/hooks/useComment';
import Ripple from '@shared/components/Buttons/Ripple';

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    photo?: string;
  };
  likesCount: number;
  likedByMe: boolean;
};

type Props = {
  task: {
    id: string;
  };
};

export default function AdviceDetail({ task }: Props) {
  /** 👉 UI-only mock */
  const { data: advice = [], isLoading } = useComments(task.id);
  const { mutate: toggleLike } = useToggleCommentLike(task.id);
  return (
    <View style={{ flex: 1 }}>
      {advice.length > 0 && <Height size={spacing.lg} />}

      {/* ================= SUPPORTIVE ADVICE ================= */}
      {advice.length > 0 && (
        <Row align="flex-start" justify="flex-start" style={{}}>
          <SectionHeader label="SUPPORTIVE ADVICE" icon="chatbubble-ellipses" />
        </Row>
      )}
      <View style={styles.containerShadow}>
        <ListView
          data={advice}
          emptyComponent={() => (
            <Shadow size="tint" style={styles.emptyAdviceCard}>
              <View style={styles.emptyHeader}>
                <View style={styles.iconWrap}>
                  <Icon
                    name="chatbubble-ellipses"
                    set="ion"
                    size={14}
                    color={colors.adviceBgHardest}
                  />
                </View>

                <TextElement style={styles.emptyTitle}>No advice yet.</TextElement>
              </View>
            </Shadow>
          )}
          renderItem={({ item }) => (
            <Shadow size="tint" style={styles.adviceCard}>
              {/* Header */}
              <View style={styles.headerRow}>
                <Avatar uri={item.user.photo} size={ms(36)} />

                <View style={styles.headerText}>
                  <TextElement style={styles.userName}>{item.user.name}</TextElement>
                  <TextElement variant="caption" color="muted" style={styles.timestamp}>
                    {timeAgo(item.createdAt)}
                  </TextElement>
                </View>

                {/* ❤️ Like */}
                <View style={[styles.likePill, item.likedByMe && styles.likePillActive]}>
                  <Ripple
                    onPress={() =>
                      toggleLike({
                        commentId: item.id,
                        like: !item.likedByMe, // 👈 THIS IS THE FIX
                      })
                    }
                  >
                    <Row align="center">
                      <Icon
                        set="ion"
                        name="heart"
                        size={ms(12)}
                        color={item.likedByMe ? colors.error : colors.muted}
                      />
                      <TextElement style={styles.likeCount}>{item.likesCount}</TextElement>
                    </Row>
                  </Ripple>
                </View>
              </View>

              {/* Body */}
              <TextElement style={styles.adviceText}>{item.text}</TextElement>
            </Shadow>
          )}
          flatListProps={{
            keyExtractor: item => item.id,
            scrollEnabled: false,
            ItemSeparatorComponent: () => <View style={styles.separator} />,
            ListFooterComponent: () => <Height size={spacing.lg} />,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyAdviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
  },

  emptyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: spacing.sm,
  },

  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.adviceIconBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.muted,
  },

  emptyDescription: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },

  containerShadow: {
    paddingVertical: vs(8),
    marginHorizontal: -spacing.md,
  },

  separator: {
    height: vs(12),
  },

  adviceCard: {
    marginHorizontal: spacing.md,
    paddingVertical: vs(14),
    paddingHorizontal: ms(14),
    borderRadius: ms(20),
    backgroundColor: colors.surface,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(10),
  },

  headerText: {
    marginLeft: ms(12),
  },

  userName: {
    fontWeight: '600',
    fontSize: ms(14),
    lineHeight: ms(16),
  },

  timestamp: {
    fontSize: ms(12),
    color: colors.muted,
    // lineHeight: ms(16),
  },

  adviceText: {
    lineHeight: ms(20),
    fontSize: ms(14),
    opacity: 0.8,
    fontWeight: '400',
    // marginLeft: ms(36 + 12), // aligns under text, not avatar
  },
  likePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(10),
    paddingVertical: vs(2),
    borderRadius: ms(999),
    backgroundColor: colors.inputBackground,
    marginLeft: 'auto',
  },

  likePillActive: {
    backgroundColor: colors.adviceBgHard,
  },

  likeCount: {
    fontSize: ms(12),
    fontWeight: '500',
    color: colors.muted,
  },
});
