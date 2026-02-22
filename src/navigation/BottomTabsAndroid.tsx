import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Icon from '@shared/components/Icons/Icon'; // ✅ your custom Icon component
import HomeScreen from '@features/Home/screens/HomeScreen';
import AddTaskScreen from '@features/Tasks/screens/AddTaskScreen';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors } from '@shared/theme';
import AnimatedTabIcon from '@shared/components/AnimatedTabBarIcon/AnimatedTabBarIcon';
import { ms, vs } from 'react-native-size-matters';
import FindFriendsMainScreen from '@features/Friends/screens/FriendsMainScreen';
import NotificationMainScreen from '@features/Notification/screens/NotifcationMainScreen';
import MyProfileMainScreen from '@features/MyProfile/screens/MyProfileMainScreen';
import { AppStackParamList } from './types/navigation';
import TextElement from '@shared/components/TextElement/TextElement';
import { useUnreadNotificationCount } from '@features/Notification/hooks/useUnreadNotificationCount';
import { useAppNavigation, useCheckAuthThenNavigate } from './types/navigationUtils';
import { useAuth } from '@features/Auth/AuthProvider';
import { haptics } from '@shared/utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAndroid } from '@shared/utils/constants';

type BottomTabParamList = {
  Home: undefined;
  Friends: undefined;
  AddTask: undefined;
  Notification: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export function useCheckAuthForTab() {
  const { user } = useAuth();
  const navigation = useAppNavigation();

  return function checkAuthForTab(
    e: { preventDefault: () => void },
    tabName: keyof AppStackParamList,
  ) {
    if (!user) {
      e.preventDefault();
      navigation.navigate('AuthIntro', {
        redirectTo: tabName,
      });
    }
  };
}

export default function BottomTabsAndroid({ route }: any) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const checkAuthForTab = useCheckAuthForTab();
  const insets = useSafeAreaInsets();
  const tabBarBottomOffset = insets.bottom;

  const shouldHideTabBar = ['SomeScreenYouWantToHideOn'].includes(routeName);

  return (
    <View style={styles.root}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: [
            {
              paddingTop: vs(8),
              height: vs(60),
              paddingBottom: vs(6),
              boxShadow: '0px -6px 12px rgba(0,0,0,0.08)', // ← TOP SHADOW

              position: 'absolute',
              left: 25,
              right: 25,
              bottom: isAndroid ? tabBarBottomOffset : vs(10),
              borderTopEndRadius: 30,
              borderTopStartRadius: 30,

              backgroundColor: colors.surface,
              paddingHorizontal: 16,

              // shadowRadius: 12,
              // elevation: 12,
            },
            shouldHideTabBar ? { display: 'none' } : undefined,
          ],
          tabBarActiveTintColor: colors.primary, // ✅ your brand's active color
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarLabelStyle: {
            paddingTop: vs(2),
            fontSize: ms(10),
          },

          tabBarIcon: ({ color, size: _size, focused }) => {
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
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          listeners={{
            tabPress: () => {
              haptics.selection();
            },
          }}
        />
        <Tab.Screen
          name="Friends"
          component={FindFriendsMainScreen}
          listeners={{
            tabPress: e => {
              checkAuthForTab(e, 'Friends');
              if (!e.defaultPrevented) haptics.selection();
            },
          }}
        />
        <Tab.Screen
          name="AddTask"
          options={{
            headerShown: false,

            tabBarButton: () => (
              <TouchableOpacity
                onPress={() => {
                  if (!checkAuthThenNavigate('AddTask')) return;
                  haptics.selection();
                }}
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
        <Tab.Screen
          name="Notification"
          component={NotificationMainScreen}
          listeners={{
            tabPress: e => {
              checkAuthForTab(e, 'Notification');
              if (!e.defaultPrevented) haptics.selection();
            },
          }}
        />
        <Tab.Screen
          name="Profile"
          component={MyProfileMainScreen}
          listeners={{
            tabPress: e => {
              checkAuthForTab(e, 'Profile');
              if (!e.defaultPrevented) haptics.selection();
            },
          }}
        />
      </Tab.Navigator>

      {insets.bottom > 0 ? (
        <View
          pointerEvents="none"
          style={[styles.navigationBarBackdrop, { height: insets.bottom }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  navigationBarBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
  },
  addButtonContainer: {
    top: -40, // raise the button
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: colors.primary,
  },
  addButton: {
    width: 70,
    height: 70,
    borderWidth: 4,
    borderRadius: 100,
    borderColor: colors.background,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 6px 20px rgba(92, 103, 192, 0.35)',
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
    fontSize: ms(10),
    fontWeight: 'bold',
    lineHeight: ms(12), // optional for fine-tuning
    color: 'white',
    textAlign: 'center',
  },
});
