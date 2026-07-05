import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddAdviceScreen from '../screens/AddAdviceScreen';
import AddMotivationScreen from '../screens/AddMotivationScreen';
import AddDecisionScreen from '../screens/AddDecisionScreen';
import AddReminderScreen from '../screens/AddReminderScreen';
import type { CreateGoalPayload } from '../types/addGoal.types';

type DraftParams = {
  draft?: CreateGoalPayload;
  submitAfterAuth?: boolean;
};

export type AddGoalStackParamList = {
  AddAdvice?: DraftParams;
  AddMotivation?: DraftParams;
  AddDecision?: DraftParams;
  AddReminder?: DraftParams;
};

const Stack = createNativeStackNavigator<AddGoalStackParamList>();

export default function AddGoalNavigator() {
  return (
    <Stack.Navigator
      id={undefined as any}
      initialRouteName="AddMotivation"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AddAdvice" component={AddAdviceScreen} />

      <Stack.Screen name="AddMotivation" component={AddMotivationScreen} />

      <Stack.Screen name="AddDecision" component={AddDecisionScreen} />

      <Stack.Screen name="AddReminder" component={AddReminderScreen} />
    </Stack.Navigator>
  );
}
