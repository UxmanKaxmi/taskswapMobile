// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddTaskScreen from '@features/tasks/screens/AddTaskScreen';

export type RootStackParamList = {
    Tasks: undefined;
    AddTask: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Add New Task' }} />
        </Stack.Navigator>
    );
}