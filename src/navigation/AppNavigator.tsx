// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens that open ABOVE the tabs
import MainDebugScreen from '@features/Debug/MainDebugScreen';
import FindFriendsScreen from '@features/Friends/screens/FindFriendsScreen';
import InviteFriendsScreen from '@features/Invite/screens/InviteFriendsScreen';
import NotificationMainScreen from '@features/Notification/screens/NotificationMainScreen';
import { AppStackParamList } from './types/navigation';
import FriendsProfileScreen from '@features/Friends/screens/FriendsProfileScreen';
import { isAndroid, isIOS, isDEV } from '@shared/utils/constants';
import BottomTabsIOS from './BottomTabsIOS';
import BottomTabsAndroid from './BottomTabsAndroid';
import AddGoalNavigator from '@features/AddGoal/navigation/AddGoalNavigator';
import GoalDetailScreen from '@features/GoalDetail/screens/GoalDetailScreen';
import SendFeedbackScreen from '@features/MyProfile/screens/SendFeedbackScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator id={undefined as any} screenOptions={{ headerShown: false }}>
      {/* Main app tabs */}
      <Stack.Screen name="Tabs" component={isIOS ? BottomTabsIOS : BottomTabsAndroid} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
      {/* Add Goal Modal */}
      <Stack.Screen
        name="AddGoal"
        component={AddGoalNavigator}
        options={{
          animation: !isAndroid ? 'slide_from_bottom' : 'fade_from_bottom',
          animationDuration: 300,
        }}
      />

      {/* Friend flows */}
      <Stack.Screen
        name="FindFriendsScreen"
        component={FindFriendsScreen}
        options={({ route: _route }) => ({
          // // presentation: route.params?.openedFromHome ? 'modal' : 'card',
          // animation: route.params?.openedFromHome ? 'slide_from_bottom' : 'default',
          // animationDuration: route.params?.openedFromHome ? 300 : undefined,
        })}
      />
      <Stack.Screen name="InviteFriendsScreen" component={InviteFriendsScreen} />
      {/* Notifications */}
      <Stack.Screen name="NotificationMainScreen" component={NotificationMainScreen} />
      {/* Debug — development builds only */}
      {isDEV && <Stack.Screen name="MainDebugScreen" component={MainDebugScreen} />}

      <Stack.Screen name="FriendsProfileScreen" component={FriendsProfileScreen} />
      <Stack.Screen name="SendFeedbackScreen" component={SendFeedbackScreen} />
    </Stack.Navigator>
  );
}
