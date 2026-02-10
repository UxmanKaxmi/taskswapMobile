// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens that open ABOVE the tabs
import MainDebugScreen from '@features/Debug/MainDebugScreen';
import AddTaskScreen from '@features/Tasks/screens/AddTaskScreen';
import FindFriendsScreen from '@features/Friends/screens/FindFriendsScreen';
import InviteFriendsScreen from '@features/Invite/screens/InviteFriendsScreen';
import NotificationMainScreen from '@features/Notification/screens/NotifcationMainScreen';
import { AppStackParamList } from './types/navigation';
import FriendsProfileScreen from '@features/Friends/screens/FriendsProfileScreen';
import { isAndroid, isIOS } from '@shared/utils/constants';
import BottomTabsIOS from './BottomTabsIOS';
import BottomTabsAndroid from './BottomTabsAndroid';
import AddTaskNavigator from '@features/AddTask/navigation/AddTaskNavigator';
import TaskDetailScreenOld from '@features/TaskDetail/screens/TaskDetailScreenOld';
import TaskDetailScreen from '@features/TaskDetail/screens/TaskDetailScreen';

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
        component={AddTaskNavigator}
        options={{
          animation: !isAndroid ? 'slide_from_bottom' : 'fade_from_bottom',
          animationDuration: 300,
        }}
      />

      {/* Choose Impact screen */}
      {/* <Stack.Screen
        name="ChooseImpactScreen"
        component={ChooseImpactScreen}
        options={{
          animation: 'slide_from_bottom',
          animationDuration: 300,
        }}
      /> */}

      {/* Friend flows */}
      <Stack.Screen
        name="FindFriendsScreen"
        component={FindFriendsScreen}
        options={({ route }) => ({
          presentation: route.params?.openedFromHome ? 'modal' : 'card',
          animation: route.params?.openedFromHome ? 'slide_from_bottom' : 'default',
          animationDuration: route.params?.openedFromHome ? 300 : undefined,
        })}
      />
      <Stack.Screen name="InviteFriendsScreen" component={InviteFriendsScreen} />
      {/* Notifications */}
      <Stack.Screen name="NotificationMainScreen" component={NotificationMainScreen} />
      {/* Debug (optional) */}
      <Stack.Screen name="MainDebugScreen" component={MainDebugScreen} />

      <Stack.Screen name="FriendsProfileScreen" component={FriendsProfileScreen} />
    </Stack.Navigator>
  );
}
