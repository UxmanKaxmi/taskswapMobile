import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  getFocusedRouteNameFromRoute,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import Icon from '@shared/components/Icons/Icon'; // ✅ your custom Icon component
import HomeScreen from '@features/Home/screens/HomeScreen';
import FindFriendsScreen from '@features/Friends/screens/FindFriendsScreen';
import AddTaskScreen from '@features/Tasks/screens/AddTaskScreen';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors } from '@shared/theme';
import AnimatedTabIcon from '@shared/components/AnimatedTabBarIcon/AnimatedTabBarIcon';
import { ms, vs } from 'react-native-size-matters';
import FindFriendsMainScreen from '@features/Friends/screens/FindFriendsMainScreen';
import NotificationMainScreen from '@features/Notification/screens/NotifcationMainScreen';
import MyProfileMainScreen from '@features/MyProfile/screens/MyProfileMainScreen';
import { AppStackParamList } from './navigation';
import TextElement from '@shared/components/TextElement/TextElement';
import { useUnreadNotificationCount } from '@features/Notification/hooks/useUnreadNotificationCount';

type BottomTabParamList = {
  Home: undefined;
  Friends: undefined;
  AddTask: undefined;
  Notification: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs({ route }: any) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const shouldHideTabBar = ['SomeScreenYouWantToHideOn'].includes(routeName);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [
          {
            paddingTop: vs(8),
            height: vs(60),
            paddingBottom: vs(6),
          },
          shouldHideTabBar ? { display: 'none' } : undefined,
        ],
        tabBarActiveTintColor: colors.primary, // ✅ your brand's active color
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          paddingTop: vs(2),
          fontSize: ms(11),
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

          // Show badge only on Notification tab
          const { count } = useUnreadNotificationCount();

          return (
            <View style={{ position: 'relative' }}>
              <AnimatedTabIcon
                name={iconName}
                size={route.name === 'AddTask' ? 24 : 18}
                color={color}
                focused={focused}
              />
              {route.name === 'Notification' && count > 0 && (
                <View style={styles.badge}>
                  <TextElement style={styles.badgeText}>{count > 99 ? '99+' : count}</TextElement>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Friends" component={FindFriendsMainScreen} />
      <Tab.Screen
        name="AddTask"
        options={{
          headerShown: false,

          tabBarButton: props => (
            <TouchableOpacity
              onPress={() => navigation.navigate('AddTask')}
              style={styles.addButtonContainer}
              activeOpacity={0.9}
            >
              <View style={styles.addButton}>
                <Icon set="fa6" name="plus" color="#fff" size={24} iconStyle="solid" />
              </View>
            </TouchableOpacity>
          ),
        }}
        component={AddTaskScreen}
      />
      <Tab.Screen name="Notification" component={NotificationMainScreen} />
      <Tab.Screen name="Profile" component={MyProfileMainScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    top: -30, // raise the button
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: ms(16),
    height: ms(16),
    paddingHorizontal: ms(5),
    justifyContent: 'center', // ✅ Center vertically
    alignItems: 'center', // ✅ Center horizontally
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: ms(10),
    fontWeight: 'bold',
    lineHeight: ms(12), // optional for fine-tuning

    textAlign: 'center',
  },
});
