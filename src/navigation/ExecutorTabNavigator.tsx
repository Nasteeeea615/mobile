import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme, Icon } from 'react-native-paper';
import { AppTheme } from '../theme/theme';

// Executor screens
import ExecutorHomeScreen from '../screens/ExecutorHomeScreen';
import ExecutorOrdersHistoryScreen from '../screens/ExecutorOrdersHistoryScreen';
import ExecutorProfileScreen from '../screens/ExecutorProfileScreen';
import SupportScreen from '../screens/SupportScreen';

const Tab = createBottomTabNavigator();

export default function ExecutorTabNavigator() {
  const theme = useTheme<AppTheme>();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.custom.tabBarActive,
        tabBarInactiveTintColor: theme.custom.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.custom.tabBarBackground,
          borderTopColor: theme.custom.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 15,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.onBackground,
      }}
    >
      <Tab.Screen
        name="ExecutorHome"
        component={ExecutorHomeScreen}
        options={{
          title: 'Заказы',
          tabBarLabel: 'Заказы',
          tabBarIcon: ({ color }) => (
            <Icon source="clipboard-list" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ExecutorHistory"
        component={ExecutorOrdersHistoryScreen}
        options={{
          title: 'История',
          tabBarLabel: 'История',
          tabBarIcon: ({ color }) => (
            <Icon source="history" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ExecutorProfile"
        component={ExecutorProfileScreen}
        options={{
          title: 'Профиль',
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ color }) => (
            <Icon source="account" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: 'Поддержка',
          tabBarLabel: 'Поддержка',
          tabBarIcon: ({ color }) => (
            <Icon source="help-circle" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
