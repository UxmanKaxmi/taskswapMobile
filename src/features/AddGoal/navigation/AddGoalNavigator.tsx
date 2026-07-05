import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddMotivationScreen from '../screens/AddMotivationScreen';
import type { CreateGoalPayload } from '../types/addGoal.types';

type DraftParams = {
  draft?: CreateGoalPayload;
  submitAfterAuth?: boolean;
};

export type AddGoalStackParamList = {
  AddMotivation?: DraftParams;
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
      <Stack.Screen name="AddMotivation" component={AddMotivationScreen} />
    </Stack.Navigator>
  );
}
