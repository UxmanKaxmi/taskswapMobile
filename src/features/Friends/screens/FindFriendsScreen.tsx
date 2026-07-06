import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { View, ActivityIndicator, SectionList } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';
import TextElement from '@shared/components/TextElement/TextElement';
import { useMatchUsers } from '../hooks/useMatchUsers';
import FriendFollowRow from '../components/FriendsFollowRow';
import {
  useNavigation,
  useFocusEffect,
  NavigationProp,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { AppStackParamList } from '@navigation/types/navigation';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { useAuth } from '@features/Auth/AuthProvider';
import { Layout } from '@shared/components/Layout';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import { ms, vs } from 'react-native-size-matters';
import { useToggleFollow } from '@features/User/hooks/useToggleFollow';
import { queryClient } from '@lib/react-query/client';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { Height } from '@shared/components/Spacing';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import { APP_NAME, isIOS } from '@shared/utils/constants';
import AnimatedBottomButton from '@shared/components/Buttons/AnimatedBottomButton';

export default function FindFriendsScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'FindFriendsScreen'>>();
  const openedFromHome = route.params?.openedFromHome;
  const { spacing, colors } = useTheme();
  const { data: matches = [], isLoading, isError, refetch } = useMatchUsers();
  const { setHasSeenFindFriendsScreen, user } = useAuth();
  const { mutate: toggleFollow, isPending, variables, error } = useToggleFollow();

  const [showCta, setShowCta] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // start hidden, then animate in
      setShowCta(false);

      // next frame => visible (so Animated values go from hidden -> shown)
      const id = setTimeout(() => setShowCta(true), 0);

      return () => {
        clearTimeout(id);
        setShowCta(false); // optional: animate out on leaving
      };
    }, []),
  );

  useEffect(() => {
    setHasSeenFindFriendsScreen(true);
  }, [setHasSeenFindFriendsScreen]);

  useEffect(() => {
    if (error) console.error('Error toggling follow:', error);
  }, [error]);

  const goHome = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleToggleFollow = useCallback((userId: string) => toggleFollow(userId), [toggleFollow]);

  const filteredMatches = useMemo(
    () => matches.filter(m => m.id !== user?.id),
    [matches, user?.id],
  );

  const ctaTitle = filteredMatches.length > 0 ? 'Continue' : 'Skip for now';

  const googleMatches = useMemo(
    () => filteredMatches.filter(m => m.source === 'google'),
    [filteredMatches],
  );

  const phoneMatches = useMemo(
    () => filteredMatches.filter(m => m.source === 'phone'),
    [filteredMatches],
  );

  const sections = useMemo(
    () =>
      [
        { title: 'From Google Contacts', data: googleMatches },
        { title: 'From Phone Contacts', data: phoneMatches },
      ].filter(s => s.data.length > 0),
    [googleMatches, phoneMatches],
  );

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (isError) {
    return (
      <Layout>
        <AppHeader title="" />
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.md }}
        >
          <TextElement variant="title" style={{ marginBottom: spacing.sm }}>
            Failed to load friends
          </TextElement>
          <TextElement variant="body" color="muted" style={{ marginBottom: spacing.md }}>
            Please check your internet connection or try again.
          </TextElement>
          <PrimaryButton
            title="Retry"
            onPress={() => {
              queryClient.invalidateQueries({ queryKey: buildQueryKey.matchedUsers() });
              refetch();
            }}
          />
        </View>
      </Layout>
    );
  }

  return (
    <Layout
      backgroundColor={colors.onboardingPaper}
      footerContent={
        <AnimatedBottomButton
          style={{
            marginBottom: isIOS ? vs(12) : vs(5),
          }}
          visible={showCta}
          title={ctaTitle}
          onPress={goHome}
          buttonColor={colors.onboardingPush}
          textColor={colors.tactileMomentumSecondary}
        />
      }
    >
      <AppHeader title="" showNavigation={true} />
      <Height size={spacing.md} />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section }) => (
          <TextElement
            variant="subtitle"
            style={{
              marginTop: spacing.md,
              marginBottom: spacing.xs,
              fontWeight: '800',
              fontSize: ms(18),
              color: colors.onboardingInk,
            }}
          >
            {section.title}
          </TextElement>
        )}
        renderItem={({ item }) => (
          <>
            <FriendFollowRow
              onPressRow={() => {}}
              isLoading={isPending && variables === item.id}
              userId={item.id}
              photo={item.photo}
              name={item.name}
              username={item.username}
              isFollowing={item.isFollowing}
              onToggleFollow={() => handleToggleFollow(item.id)}
            />
            {/* <TextElement
              variant="caption"
              color="placeHolder"
              style={{ marginTop: spacing.xs, fontStyle: 'italic' }}
            >
              We only use your contacts to find friends. We never message anyone without your
              permission.
            </TextElement> */}
          </>
        )}
        ItemSeparatorComponent={AppBorder}
        ListHeaderComponent={() => (
          <View style={{ marginVertical: spacing.sm }}>
            <TextElement
              style={{
                fontWeight: '800',
                fontSize: ms(28),
                lineHeight: ms(34),
                letterSpacing: -0.5,
                color: colors.onboardingInk,
              }}
            >
              {openedFromHome ? 'Find your people ' : 'Find your people'}{' '}
              <TextElement style={{ fontSize: ms(26) }}>👋</TextElement>
            </TextElement>

            <TextElement
              variant="body"
              color="muted"
              style={{ marginTop: spacing.sm, fontSize: ms(15), lineHeight: ms(21) }}
            >
              {openedFromHome
                ? `Follow a few friends to make accountability feel lighter`
                : `Add friends so ${APP_NAME} feels a little more familiar.`}
            </TextElement>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TextElement variant="body" color="muted">
              No friends here yet.
            </TextElement>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: vs(40) }}
      />
    </Layout>
  );
}
