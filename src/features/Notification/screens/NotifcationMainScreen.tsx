import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ViewToken,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';
import { useDebouncedCallback } from 'use-debounce';
import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, colors } from '@shared/theme';
import { AppStackParamList } from 'navigation/navigation';
import { useNotifications } from '../hooks/useNotifications';
import { useBatchMarkNotificationsAsRead } from '../hooks/useBatchMarkNotificationsAsRead';
import { timeAgo } from '@shared/utils/helperFunctions';
import EmptyState from '@features/Empty/EmptyState';
import { NotificationDTO } from '../types/notification.types';
import Row from '@shared/components/Layout/Row';
import { ms, vs } from 'react-native-size-matters';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import Avatar from '@shared/components/Avatar/Avatar';
import NotificationCard from '../components/DefaultNotification';
import { queryClient } from '@lib/react-query/client';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';

export default function NotificationMainScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const { mutate: markBatch } = useBatchMarkNotificationsAsRead();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const seenIdsRef = useRef<Set<string>>(new Set());

  const flushSeenIds = () => {
    console.log('📦', queryClient.getQueryData([QueryKeys.Notification]));
    const ids = Array.from(seenIdsRef.current).filter(Boolean);
    console.log('📌 Seen IDs:', ids);
    if (ids.length === 0) return;
    // ✅ Optimistically update cache

    queryClient.setQueryData<NotificationDTO[]>(buildQueryKey.notifications(), old => {
      if (!old) return [];

      const updated = old.map(n => (ids.includes(n.id) ? { ...n, read: true } : n));

      return [...updated]; // ✅ return a new array reference to force re-render
    });

    // ✅ Send to server
    markBatch(ids);
    seenIdsRef.current.clear();
  };

  // ✅ useDebouncedCallback from use-debounce
  const debouncedFlush = useDebouncedCallback(flushSeenIds, 1500);

  const handleViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    viewableItems.forEach(viewable => {
      const item = viewable.item as NotificationDTO;
      if (!item.read && !seenIdsRef.current.has(item.id)) {
        seenIdsRef.current.add(item.id);
      }
    });
    debouncedFlush();
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 60,
  };

  useEffect(() => {
    return () => {
      debouncedFlush.cancel(); // cleanup
    };
  }, []);

  function getTimeGroupLabel(date: string) {
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    if (isThisWeek(d)) return 'This Week';
    if (isThisYear(d)) return format(d, 'MMMM d');
    return 'Earlier';
  }

  function groupNotifications(notifications: NotificationDTO[]) {
    const grouped: Record<string, NotificationDTO[]> = {};

    notifications.forEach(notification => {
      const group = getTimeGroupLabel(notification.createdAt);
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(notification);
    });

    const sortOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];

    return Object.entries(grouped)
      .sort(([a], [b]) => {
        const indexA = sortOrder.indexOf(a) !== -1 ? sortOrder.indexOf(a) : sortOrder.length;
        const indexB = sortOrder.indexOf(b) !== -1 ? sortOrder.indexOf(b) : sortOrder.length;
        return indexA - indexB;
      })
      .map(([title, data]) => ({ title, data }));
  }

  const sections = useMemo(() => groupNotifications(notifications), [notifications]);

  const handlePress = (id: string) => {
    // markAsRead(id);
  };

  if (isLoading) {
    return (
      <View style={{ alignSelf: 'center', justifyContent: 'center', flex: 1 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <Layout allowPadding={false}>
      {sections.length === 0 ? (
        <Row align="center" justify="center" flex>
          <EmptyState title="No notifications" subtitle="You're all caught up!" />
        </Row>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeaderContainer}>
              <TextElement variant="subtitle" weight="600" style={styles.sectionHeader}>
                {title}
              </TextElement>
            </View>
          )}
          ItemSeparatorComponent={() => <AppBorder />}
          renderItem={({ item }) => {
            const bgColor = item.read ? colors.background : colors.adviceBg;
            return (
              <View style={[styles.rowContainer, { backgroundColor: bgColor }]}>
                <NotificationCard item={item} onPress={() => {}} />
              </View>
            );
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    paddingVertical: vs(12),
    paddingHorizontal: spacing.md,

    backgroundColor: colors.background,
  },
  sectionHeader: {
    fontSize: ms(20),
    color: colors.text,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    // paddingVertical: spacing.sm,
    // backgroundColor: '#fff',
  },

  textContainer: {
    flex: 1,
    marginLeft: ms(15),
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
    marginLeft: spacing.sm,
  },
  time: {
    fontSize: ms(12),
  },
});
