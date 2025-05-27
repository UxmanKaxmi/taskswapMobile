import React from 'react';
import { View, StyleSheet, SectionList, Image, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';

import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, colors } from '@shared/theme';
import { AppStackParamList } from 'navigation/navigation';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkNotificationAsRead } from '../hooks/useMarkNotificationAsRead';
import { timeAgo } from '@shared/utils/helperFunctions';
import EmptyState from '@features/Empty/EmptyState';
import { NotificationDTO } from '../types/notification.types';
import Row from '@shared/components/Layout/Row';
import { ms, vs } from 'react-native-size-matters';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import Avatar from '@shared/components/Avatar/Avatar';
import NotificationCard from '../components/DefaultNotification';

export default function NotificationMainScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();

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
      .sort(([a], [b]) => sortOrder.indexOf(a) - sortOrder.indexOf(b))
      .map(([title, data]) => ({ title, data }));
  }

  const sections = groupNotifications(notifications);

  const handlePress = (id: string) => {
    markAsRead(id);
  };

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
                <NotificationCard item={item} onPress={() => handlePress(item.id)} />
              </View>
            );
          }}
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
