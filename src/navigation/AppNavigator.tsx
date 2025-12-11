// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens that open ABOVE the tabs
import MainDebugScreen from '@features/Debug/MainDebugScreen';
import TaskDetailScreen from '@features/Tasks/screens/TaskDetailScreen';
import AddTaskScreen from '@features/Tasks/screens/AddTaskScreen';
import FindFriendsScreen from '@features/Friends/screens/FindFriendsScreen';
import InviteFriendsScreen from '@features/Invite/screens/InviteFriendsScreen';
import NotificationMainScreen from '@features/Notification/screens/NotifcationMainScreen';
import { AppStackParamList } from './types/navigation';
import FriendsProfileScreen from '@features/Friends/screens/FriendsProfileScreen';
import { isIOS } from '@shared/utils/constants';
import BottomTabsIOS from './BottomTabsIOS';
import BottomTabsAndroid from './BottomTabsAndroid';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main app tabs */}
      <Stack.Screen name="Tabs" component={BottomTabsAndroid} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      {/* Add Task Modal */}
      <Stack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      {/* Friend flows */}
      <Stack.Screen name="FindFriendsScreen" component={FindFriendsScreen} />
      <Stack.Screen name="InviteFriendsScreen" component={InviteFriendsScreen} />
      {/* Notifications */}
      <Stack.Screen name="NotificationMainScreen" component={NotificationMainScreen} />
      {/* Debug (optional) */}
      <Stack.Screen name="MainDebugScreen" component={MainDebugScreen} />

      <Stack.Screen name="FriendsProfileScreen" component={FriendsProfileScreen} />
    </Stack.Navigator>
  );
}
