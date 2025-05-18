// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen from '@features/home/screens/HomeScreen';
import { AppStackParamList, MainStackParamList } from '@shared/types/navigation';
import AddTaskScreen from '@features/tasks/screens/AddTaskScreen';
import { LogoutButton } from '@features/auth/components/LogoutButton';
import TaskDetailScreen from '@features/tasks/screens/TaskDetailScreen';
import FindFriendsScreen from '@features/findFriend/screens/FindFriendsScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="FindFriendsScreen"
        component={FindFriendsScreen}
        options={{
          title: 'Find Friends',

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
          // headerRight: () => <LogoutButton />,
        }}
      />
      {/* <Stack.Screen name="TaskDetails" component={() => <></>} /> */}
    </Stack.Navigator>
  );
};
