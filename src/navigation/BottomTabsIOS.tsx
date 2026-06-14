import React from 'react';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import HomeScreen from '@features/Home/screens/HomeScreen';
import FriendsMainScreen from '@features/Friends/screens/FriendsMainScreen';
import NotificationMainScreen from '@features/Notification/screens/NotifcationMainScreen';
import MyProfileMainScreen from '@features/MyProfile/screens/MyProfileMainScreen';

import { useUnreadNotificationCount } from '@features/Notification/hooks/useUnreadNotificationCount';
import { useAuth } from '@features/Auth/AuthProvider';
import { useCheckAuthThenNavigate } from './types/navigationUtils';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors } from '@shared/theme';
import { AppStackParamList } from './types/navigation';
import AddTaskNavigator from '@features/AddTask/navigation/AddTaskNavigator';

const Tab = createNativeBottomTabNavigator();

export default function BottomTabsIOS() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { user } = useAuth();
  const { count: unreadCount } = useUnreadNotificationCount();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const checkAuthForTab = React.useCallback(
    (e: { preventDefault: () => void }, tabName: keyof AppStackParamList) => {
      if (!user) {
        e.preventDefault();
        navigation.navigate('AuthIntro', {
          redirectTo: tabName,
        });
      }
    },
    [navigation, user],
  );

  return (
    <Tab.Navigator
      id={undefined as any}
      tabBarInactiveTintColor={colors.text}
      tabBarActiveTintColor={colors.tactileMomentumPrimary}
      hapticFeedbackEnabled
      minimizeBehavior="automatic"
      sidebarAdaptable={false}
      screenOptions={
        {
          // tabBarInactiveTintColor: colors.tabInactive,
          // tabBarInactiveTintColor: '#12334', // 👈 unfocused icon color
        }
      }
    >
      {/* HOME */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => ({
            sfSymbol: focused ? 'house.fill' : 'house',
          }),
        }}
      />

      {/* FRIENDS */}
      <Tab.Screen
        name="Friends"
        component={FriendsMainScreen}
        listeners={{
          tabPress: (e: any) => {
            checkAuthForTab(e, 'Friends' as keyof AppStackParamList);
          },
        }}
        options={{
          tabBarIcon: ({ focused }) => ({
            sfSymbol: focused ? 'person.2.fill' : 'person.2',
          }),
        }}
      />

      {/* ADD TASK → FAB BUTTON */}
      <Tab.Screen
        name="AddTask"
        component={AddTaskNavigator}
        listeners={{
          tabPress: (e: any) => {
            e.preventDefault();
            checkAuthThenNavigate('AddTask');
          },
        }}
        options={{
          tabBarIcon: ({ focused }) => ({
            sfSymbol: 'plus',
          }),

          preventsDefault: true,
          role: 'search',
        }}
      />

      {/* NOTIFICATION */}
      <Tab.Screen
        name="Notification"
        component={NotificationMainScreen}
        listeners={{
          tabPress: (e: any) => {
            checkAuthForTab(e, 'Notification' as keyof AppStackParamList);
          },
        }}
        options={{
          title: 'Inbox',
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ focused }) => ({
            sfSymbol: focused ? 'tray.fill' : 'tray',
          }),
          tabBarBadge:
            unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount.toString()) : undefined,
        }}
      />

      {/* PROFILE */}
      <Tab.Screen
        name="Profile"
        component={MyProfileMainScreen}
        listeners={{
          tabPress: (e: any) => {
            checkAuthForTab(e, 'Profile' as keyof AppStackParamList);
          },
        }}
        options={{
          tabBarIcon: ({ focused }) => ({
            sfSymbol: focused ? 'person.crop.circle.fill' : 'person.crop.circle',
          }),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    top: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
