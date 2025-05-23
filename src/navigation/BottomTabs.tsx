import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Icon from '@shared/components/Icons/Icon'; // ✅ your custom Icon component
import HomeScreen from '@features/Home/screens/HomeScreen';
import FindFriendsScreen from '@features/Friends/screens/FindFriendsScreen';
import AddTaskScreen from '@features/Tasks/screens/AddTaskScreen';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors } from '@shared/theme';
import AnimatedTabIcon from '@shared/components/AnimatedTabBarIcon/AnimatedTabBarIcon';
import { ms } from 'react-native-size-matters';
import FriendsMainScreen from '@features/Friends/screens/FriendsMainScreen';
import NotificationMainScreen from '@features/Notification/screens/NotifcationMainScreen';
import MyProfileMainScreen from '@features/MyProfile/screens/MyProfileMainScreen';

export type BottomTabParamList = {
  Home: undefined;
  Friends: undefined;
  AddTask: undefined;
  Notification: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs({ route }: any) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';

  const shouldHideTabBar = ['SomeScreenYouWantToHideOn'].includes(routeName);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [
          {
            paddingTop: 8,
            paddingHorizontal: 15,
          },
          shouldHideTabBar ? { display: 'none' } : undefined,
        ],
        tabBarActiveTintColor: colors.primary, // ✅ your brand's active color
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          paddingTop: 2,
          fontSize: 11,
        },

        tabBarIcon: ({ color, size, focused }) => {
          const iconMap: Record<keyof BottomTabParamList, string> = {
            Home: 'house-chimney-medical',
            Friends: 'people-group',
            AddTask: 'bell-slash',
            Notification: 'bell',
            Profile: 'person',
          };

          const iconName =
            iconMap[route.name as keyof BottomTabParamList] ?? 'house-chimney-medical';

          return (
            <AnimatedTabIcon
              name={iconName}
              size={route.name === 'AddTask' ? 24 : 18}
              color={color}
              focused={focused}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Friends" component={FriendsMainScreen} />
      <Tab.Screen
        name="AddTask"
        // options={{
        //   tabBarButton: props => (
        //     <TouchableOpacity
        //       onPress={() => {}}
        //       style={styles.addButtonContainer}
        //       activeOpacity={0.9}
        //     >
        //       <View style={styles.addButton}>
        //         <Icon name="plus" color="#fff" size={24} iconStyle="solid" />
        //       </View>
        //     </TouchableOpacity>
        //   ),
        // }}
        component={AddTaskScreen}
      />
      <Tab.Screen name="Notification" component={NotificationMainScreen} />
      <Tab.Screen name="Profile" component={MyProfileMainScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    top: -18, // raise the button
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
