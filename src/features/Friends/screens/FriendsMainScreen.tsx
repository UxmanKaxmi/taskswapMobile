import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import FriendList from '../components/FriendList';
import TabButton from '../components/TabButton';
import { Layout } from '@shared/components/Layout';
import Row from '@shared/components/Layout/Row';
import Search from '@shared/components/Search/Search';
import TextElement from '@shared/components/TextElement/TextElement';
import { Height } from '@shared/components/Spacing';
import { AppStackParamList } from 'navigation/navigation';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
export default function FriendsMainScreen() {
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
  const [searchQuery, setSearchQuery] = useState('');
  const isSearching = !!searchQuery.trim();
  const previousIsSearching = useRef(isSearching);
  useEffect(() => {
    if (previousIsSearching.current !== isSearching) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      previousIsSearching.current = isSearching;
    }
  }, [isSearching]);
  return (
    <Layout>
      <Search
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder="Search friends..."
      />

      {isSearching ? (
        <>
          <Height size={5} />
          <TextElement
            variant="subtitle"
            style={{
              fontWeight: '600',
              borderColor: '#000',
            }}
          >
            Search Results
          </TextElement>
        </>
      ) : (
        <>
          <Row>
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

      <FriendList type={activeTab} searchQuery={searchQuery} />
    </Layout>
  );
}
