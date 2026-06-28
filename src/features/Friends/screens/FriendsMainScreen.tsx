import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import FriendList from '../components/FriendList';
import TabButton from '../components/TabButton';
import { Layout } from '@shared/components/Layout';
import Row from '@shared/components/Layout/Row';
import Search from '@shared/components/Search/Search';
import PageHeader from '@shared/components/PageHeader/PageHeader';
import TextElement from '@shared/components/TextElement/TextElement';
import { Height } from '@shared/components/Spacing';
import { useAuth } from '@features/Auth/AuthProvider';
import { colors, spacing } from '@shared/theme';
import { ms } from 'react-native-size-matters';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
export default function FindFriendsMainScreen() {
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
  const [searchQuery, setSearchQuery] = useState('');
  const isSearching = !!searchQuery.trim();
  const { loading } = useAuth();

  const searchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Animated.timing(searchAnim, {
      toValue: isSearching ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isSearching]);

  if (loading) return null;

  // if (!user) {
  //   navigation.navigate('Auth');
  //   return null;
  // }

  return (
    <Layout
      allowPaddingHorizontal={false}
      edgesProp={['top']}
      backgroundColor={colors.onboardingPaper}
    >
      <View style={styles.screen}>
        <View style={styles.headerBlock}>
          <PageHeader title="Friends" />

          <Search
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search friends..."
          />

          {/* Tabs */}
          <Animated.View
            style={{
              opacity: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [
                {
                  translateY: searchAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  }),
                },
              ],
            }}
          >
            {!isSearching && (
              <>
                <Row
                  justify="flex-start"
                  gap={ms(18)}
                  style={{
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  }}
                >
                  <TabButton
                    title="Following"
                    isActive={activeTab === 'following'}
                    onPress={() => setActiveTab('following')}
                  />
                  <TabButton
                    title="Followers"
                    isActive={activeTab === 'followers'}
                    onPress={() => setActiveTab('followers')}
                  />
                </Row>
                <Height size={6} />
              </>
            )}
          </Animated.View>

          {/* Search Results Header */}
          <Animated.View
            style={{
              opacity: searchAnim,
              transform: [
                {
                  translateY: searchAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            }}
          >
            {isSearching && (
              <>
                <Height size={5} />
                <TextElement variant="subtitle" style={{ fontWeight: '600' }}>
                  Search Results
                </TextElement>
              </>
            )}
          </Animated.View>
        </View>

        <FriendList type={activeTab} searchQuery={searchQuery} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerBlock: {
    paddingHorizontal: spacing.lg,
  },
});
