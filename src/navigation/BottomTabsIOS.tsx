import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

// ---- Screens / Stacks you already have ----
import TodayScreen from '@screens/Dashboard/today/screens/TodayScreen';
import AccountV4 from '@screens/Dashboard/account_v4';
import MarketScreen from '@screens/Dashboard/market_v4';
import Rewards from '@screens/Dashboard/rewards';
import PayRouteResolver from '@screens/Dashboard/FassetPay/screens/PayRouteResolver';

// ------------------------------------------

const Tab = createNativeBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Pay stack (native-safe)
 */
function PayStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PayResolver" component={PayRouteResolver} />
    </Stack.Navigator>
  );
}

/**
 * ✅ ONE and ONLY native bottom tab navigator
 */
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={TodayScreen} />
      <Tab.Screen name="Account" component={AccountV4} />
      <Tab.Screen name="Pay" component={PayStack} />
      <Tab.Screen name="Markets" component={MarketScreen} />
      <Tab.Screen name="Rewards" component={Rewards} />
    </Tab.Navigator>
  );
}

/**
 * Root navigation
 * ❗ No nested tabs
 * ❗ No dynamic tab creation
 */
export default function Route() {
  const { isLogin } = useSelector(state => state.auth);

  return (
    <NavigationContainer>
      {isLogin ? <MainTabs /> : null /* plug AuthNavigator here if needed */}
    </NavigationContainer>
  );
}

