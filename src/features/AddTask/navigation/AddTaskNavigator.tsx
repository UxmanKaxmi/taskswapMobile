import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SelectTaskTypeScreen from '../screens/SelectTaskTypeScreen';
import AddAdviceScreen from '../screens/AddAdviceScreen';
import AddMotivationScreen from '../screens/AddMotivationScreen';
import AddDecisionScreen from '../screens/AddDecisionScreen';
import AddReminderScreen from '../screens/AddReminderScreen';
import ChooseImpactScreen from '../screens/ChooseImpactScreen';

export type AddTaskStackParamList = {
  ChooseImpactScreen: undefined;

  AddAdvice: undefined;
  AddMotivation: undefined;
  AddDecision: undefined;
  AddReminder: undefined;
};

const Stack = createNativeStackNavigator<AddTaskStackParamList>();

export default function AddTaskNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ChooseImpactScreen"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ChooseImpactScreen" component={ChooseImpactScreen} />

      <Stack.Screen name="AddAdvice" component={AddAdviceScreen} />

      <Stack.Screen name="AddMotivation" component={AddMotivationScreen} />

      <Stack.Screen name="AddDecision" component={AddDecisionScreen} />

      <Stack.Screen name="AddReminder" component={AddReminderScreen} />
    </Stack.Navigator>
  );
}
