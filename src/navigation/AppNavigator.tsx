import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '../theme/theme';

// Auth screens
import EmailInputScreen from '../screens/EmailInputScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import ExecutorRegistrationScreen from '../screens/ExecutorRegistrationScreen';

// Tab Navigators
import ClientTabNavigator from './ClientTabNavigator';
import ExecutorTabNavigator from './ExecutorTabNavigator';

// Detail screens (outside tabs)
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import PaymentScreen from '../screens/PaymentScreen';
import TicketHistoryScreen from '../screens/TicketHistoryScreen';
import TicketDetailsScreen from '../screens/TicketDetailsScreen';
import ExecutorBalanceScreen from '../screens/ExecutorBalanceScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const navigationRef = useRef<any>(null);
  const theme = useTheme<AppTheme>();

  return (
    <NavigationContainer
      ref={navigationRef}
      onUnhandledAction={(action) => {
        console.warn('Unhandled navigation action:', action);
        // Log available routes for debugging
        if (__DEV__) {
          console.warn('Available routes:', navigationRef.current?.getRootState());
        }
      }}
    >
      <Stack.Navigator
        initialRouteName="EmailInput"
        screenOptions={{
          headerShown: true,
          animation: 'slide_from_right',
          animationDuration: 250,
          animationTypeForReplace: 'push',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerStyle: {
            backgroundColor: theme.custom.background,
          },
          headerTintColor: theme.custom.text,
          headerTitleStyle: {
            color: theme.custom.text,
          },
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen
          name="EmailInput"
          component={EmailInputScreen}
          options={{ title: 'Вход', headerShown: false }}
        />
        <Stack.Screen
          name="Registration"
          component={RegistrationScreen}
          options={{ title: 'Регистрация' }}
        />
        <Stack.Screen
          name="ExecutorRegistration"
          component={ExecutorRegistrationScreen}
          options={{ title: 'Регистрация исполнителя' }}
        />

        {/* Client Tab Navigator */}
        <Stack.Screen
          name="ClientTabs"
          component={ClientTabNavigator}
          options={{ headerShown: false }}
        />

        {/* Executor Tab Navigator */}
        <Stack.Screen
          name="ExecutorTabs"
          component={ExecutorTabNavigator}
          options={{ headerShown: false }}
        />

        {/* Detail Screens (accessible from tabs) */}
        <Stack.Screen
          name="OrderDetails"
          component={OrderDetailsScreen}
          options={{ title: 'Детали заказа' }}
        />
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistoryScreen}
          options={{ title: 'История заказов' }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: 'Оплата' }}
        />
        <Stack.Screen
          name="TicketHistory"
          component={TicketHistoryScreen}
          options={{ title: 'История обращений' }}
        />
        <Stack.Screen
          name="TicketDetails"
          component={TicketDetailsScreen}
          options={{ title: 'Обращение' }}
        />
        <Stack.Screen
          name="ExecutorBalance"
          component={ExecutorBalanceScreen}
          options={{ title: 'Баланс' }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ title: 'Редактирование профиля' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
