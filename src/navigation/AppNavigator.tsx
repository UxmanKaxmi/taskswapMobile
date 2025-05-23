// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';

import { AppStackParamList, MainStackParamList } from 'navigation/navigation';
import AddTaskScreen from '@features/Tasks/screens/AddTaskScreen';
import TaskDetailScreen from '@features/Tasks/screens/TaskDetailScreen';
import BottomTabs from './BottomTabs';
import { LogoutButton } from '@features/Auth/components/LogoutButton';
import FindFriendsScreen from '@features/Friends/screens/FindFriendsScreen';
import HomeScreen from '@features/Home/screens/HomeScreen';
import FriendsMainScreen from '@features/Friends/screens/FriendsMainScreen';
import NotificationMainScreen from '@features/Notification/screens/NotifcationMainScreen';
import MyProfileMainScreen from '@features/MyProfile/screens/MyProfileMainScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  const route = useRoute<RouteProp<MainStackParamList, 'App'>>();
  const showFindFriends = route?.params?.showFindFriends;

  return (
    <Stack.Navigator>
      {/* Main tab navigator */}
      <Stack.Screen name="Tabs" component={BottomTabs} options={{ headerShown: false }} />

      {/* Modal or deep screens */}
      <Stack.Screen
        name="FindFriendsScreen"
        component={FindFriendsScreen}
        options={{
          title: 'Find Friends',
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="FriendsMainScreen"
        component={FriendsMainScreen}
        options={{
          title: 'Friends',

          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="MyProfileMainScreen"
        component={MyProfileMainScreen}
        options={{
          title: 'My Profile',
          headerRight: () => <LogoutButton />,
        }}
      />

      <Stack.Screen
        name="NotificationMainScreen"
        component={NotificationMainScreen}
        options={{
          title: 'Notifications',
          headerRight: () => <LogoutButton />,
        }}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{
          title: 'Create New Task',
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{
          title: 'Task Details',
        }}
      />
    </Stack.Navigator>
  );
}
