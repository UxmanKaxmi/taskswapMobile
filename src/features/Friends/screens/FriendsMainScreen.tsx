// src/features/friends/screens/FriendsScreen.tsx
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import FriendList from '../components/FriendList';
import TabButton from '../components/TabButton';
import { Layout } from '@shared/components/Layout';
import Row from '@shared/components/Layout/Row';
import TextElement from '@shared/components/TextElement/TextElement';
import { Height } from '@shared/components/Spacing';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { AppStackParamList } from 'navigation/navigation';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Search from '@shared/components/Search/Search';

export default function FriendsMainScreen() {
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout>
      <Search
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder="Search friends..."
      />
      <Row style={{}}>
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
      <FriendList type={activeTab} searchQuery={searchQuery} />
      {/* <View
        style={{
          justifyContent: 'flex-end',
          alignContent: 'center',
          alignItems: 'center',
          alignSelf: 'flex-end',
        }}
      >
        <PrimaryButton
          title="Find contacts"
          onPress={() => navigation.navigate('FindFriendsScreen')}
        />
      </View> */}
    </Layout>
  );
}
