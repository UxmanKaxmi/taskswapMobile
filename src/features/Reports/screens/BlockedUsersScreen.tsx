import React, { useCallback } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import { useBlockedUsers, useUnblockUser, type BlockedUser } from '@features/Reports';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import Avatar from '@shared/components/Avatar/Avatar';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import Layout from '@shared/components/Layout/Layout';
import Row from '@shared/components/Layout/Row';
import ListView from '@shared/components/ListView/ListView';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { getAvatarColor } from '@shared/utils/avatarColor';
import { showToast } from '@shared/utils/toast';

export default function BlockedUsersScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { data: blockedUsers = [], isLoading, isRefetching, refetch } = useBlockedUsers();
  const unblockUser = useUnblockUser();

  const handleUnblock = useCallback(
    (user: BlockedUser) => {
      Alert.alert('Unblock user?', `${user.name} will be able to appear in your feed again.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: () => {
            unblockUser.mutate(
              { userId: user.id },
              {
                onSuccess: () => {
                  showToast({
                    type: 'success',
                    title: 'User unblocked',
                    message: `${user.name} can appear in your feed again.`,
                  });
                },
                onError: (err: any) => {
                  const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
                  showToast({
                    type: 'error',
                    title: 'Could not unblock user',
                    message: apiMessage || 'Please try again in a moment.',
                  });
                },
              },
            );
          },
        },
      ]);
    },
    [unblockUser],
  );

  return (
    <Layout
      backgroundColor={colors.onboardingPaper}
      allowPaddingVertical={false}
      allowPaddingHorizontal={false}
    >
      <View style={styles.headerWrap}>
        <AppHeader title="Blocked users" />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.onboardingInk} />
        </View>
      ) : (
        <ListView
          data={blockedUsers}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          flatListProps={{
            ItemSeparatorComponent: () => <AppBorder color={colors.onboardingLine} />,
            keyExtractor: user => user.id,
            contentContainerStyle: styles.listContent,
          }}
          emptyComponent={<BlockedUsersEmptyState />}
          renderItem={({ item }) => (
            <BlockedUserRow
              user={item}
              isLoading={unblockUser.isPending && unblockUser.variables?.userId === item.id}
              onUnblock={() => handleUnblock(item)}
            />
          )}
        />
      )}
    </Layout>
  );
}

function BlockedUsersEmptyState() {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.emptyWrap}>
      <TextElement style={styles.emptyTitle}>No blocked users</TextElement>
      <TextElement style={styles.emptySubtitle}>
        People you block from task options will show up here.
      </TextElement>
    </View>
  );
}

type BlockedUserRowProps = {
  user: BlockedUser;
  isLoading: boolean;
  onUnblock: () => void;
};

function BlockedUserRow({ user, isLoading, onUnblock }: BlockedUserRowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const handle = user.username?.trim() ? `@${user.username.trim()}` : user.email;
  const photo = user.photo ?? user.avatar;

  return (
    <Row align="center" justify="space-between" style={styles.row}>
      <Row align="center" style={styles.userInfo}>
        <Avatar
          uri={photo}
          fallback={user.name}
          size={44}
          borderColor="transparent"
          fallbackStyle={{ backgroundColor: getAvatarColor(user.id || user.name) }}
          textStyle={styles.avatarText}
        />
        <View style={styles.textBlock}>
          <TextElement numberOfLines={1} style={styles.name}>
            {user.name}
          </TextElement>
          {!!handle && (
            <TextElement numberOfLines={1} style={styles.handle}>
              {handle}
            </TextElement>
          )}
        </View>
      </Row>

      <OutlineButton
        title="Unblock"
        onPress={onUnblock}
        isLoading={isLoading}
        disabled={isLoading}
        borderColor={colors.onboardingInk}
        backgroundColor={colors.onboardingInk}
        textColor={colors.onboardingCard}
        textStyle={styles.buttonText}
        style={styles.button}
      />
    </Row>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    headerWrap: {
      paddingHorizontal: spacing.lg,
      paddingTop: vs(10),
    },
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: vs(18),
      paddingBottom: vs(32),
    },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingBottom: vs(70),
    },
    emptyTitle: {
      textAlign: 'center',
      fontSize: ms(25),
      lineHeight: ms(31),
      fontWeight: '600',
      color: colors.onboardingInk,
      marginBottom: vs(8),
    },
    emptySubtitle: {
      textAlign: 'center',
      maxWidth: ms(300),
      fontSize: ms(15),
      lineHeight: ms(21),
      color: colors.onboardingMuted,
    },
    row: {
      minHeight: vs(70),
      paddingVertical: vs(11),
    },
    userInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    avatarText: {
      color: colors.tactileMomentumSecondary,
      fontWeight: '800',
    },
    textBlock: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    name: {
      fontSize: ms(15),
      fontWeight: '700',
      color: colors.onboardingInk,
    },
    handle: {
      marginTop: vs(2),
      fontSize: ms(12),
      color: colors.onboardingMuted,
    },
    button: {
      minWidth: ms(94),
      borderRadius: 999,
      paddingVertical: vs(7),
      paddingHorizontal: ms(14),
    },
    buttonText: {
      fontSize: ms(12),
      fontWeight: '700',
    },
  });
