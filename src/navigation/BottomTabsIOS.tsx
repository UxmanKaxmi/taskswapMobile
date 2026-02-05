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

const Tab = createNativeBottomTabNavigator();

export default function BottomTabsIOS() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { user } = useAuth();
  const { count: unreadCount } = useUnreadNotificationCount();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();

  return (
    <Tab.Navigator
      tabBarInactiveTintColor={colors.tabInactive}
      tabBarActiveTintColor={colors.primary}
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
            iconSize: 2, // 👈 SMALL ICON
          }),
        }}
      />

      {/* FRIENDS */}
      <Tab.Screen
        name="Friends"
        component={FriendsMainScreen}
        options={{
          tabBarIcon: ({ focused }) => ({
            sfSymbol: focused ? 'person.2.fill' : 'person.2',
            iconSize: 16, // 👈 SMALL ICON
          }),
        }}
      />

      {/* ADD TASK → FAB BUTTON */}
      {/* <Tab.Screen
        name="AddTaskButton"
        component={HomeScreen}
        options={{
          tabBarButton: () => (
            <TouchableOpacity
              onPress={() => checkAuthThenNavigate('AddTask')}
              style={styles.addButtonContainer}
            >
              <View style={styles.addButton}>
                <TextElement style={{ color: '#FFF', fontSize: 26 }}>+</TextElement>
              </View>
            </TouchableOpacity>
          ),
          tabBarIcon: () => null,
        }}
      /> */}

      {/* NOTIFICATION */}
      <Tab.Screen
        name="Notification"
        component={NotificationMainScreen}
        options={{
          tabBarIcon: ({ focused }) => ({
            sfSymbol: focused ? 'bell.fill' : 'bell',
            iconSize: 16, // 👈 SMALL ICON
          }),
        }}
      />

      {/* PROFILE */}
      <Tab.Screen
        name="Profile"
        component={MyProfileMainScreen}
        options={{
          tabBarIcon: ({ focused }) => ({
            sfSymbol: focused ? 'person.crop.circle.fill' : 'person.crop.circle',
            iconSize: 16, // 👈 SMALL ICON
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
