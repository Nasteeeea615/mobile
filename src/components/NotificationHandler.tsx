import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import notificationService, { NotificationData } from '../services/notificationService';

interface NotificationHandlerProps {
  onNotificationReceived?: (notification: Notifications.Notification) => void;
}

const NotificationHandler: React.FC<NotificationHandlerProps> = ({ onNotificationReceived }) => {
  const navigation = useNavigation<any>();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications();

    // Listener for notifications received while app is in foreground
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification);
        
        // Call custom callback if provided
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }

        // Update badge count
        updateBadgeCount();
      }
    );

    // Listener for when user taps on notification
    responseListener.current = notificationService.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        handleNotificationTap(response);
      }
    );

    // Clear badge when app opens
    notificationService.clearBadge();

    return () => {
      // Cleanup listeners
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        console.log('Push notification token:', token);
      } else {
        console.log('Failed to get push notification token');
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const updateBadgeCount = async () => {
    try {
      const notifications = await notificationService.getNotifications();
      const unreadCount = notifications.filter((n: any) => !n.is_read).length;
      await notificationService.setBadgeCount(unreadCount);
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  };

  const handleNotificationTap = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as NotificationData;
    
    if (!data) {
      return;
    }

    // Mark notification as read
    if (data.notificationId) {
      notificationService.markAsRead(data.notificationId);
    }

    // Navigate based on notification type and data
    switch (data.type) {
      case 'order_accepted':
      case 'order_completed':
        if (data.orderId) {
          navigation.navigate('OrderDetails', { orderId: data.orderId });
        }
        break;

      case 'payment_success':
        if (data.orderId) {
          navigation.navigate('OrderDetails', { orderId: data.orderId });
        }
        break;

      case 'new_order':
      case 'urgent_order_assigned':
        navigation.navigate('ExecutorHome');
        break;

      case 'ticket_reply':
        if (data.screen === 'Support') {
          navigation.navigate('Support');
        }
        break;

      default:
        // Navigate to screen specified in data
        if (data.screen) {
          navigation.navigate(data.screen);
        }
        break;
    }

    // Update badge count after handling
    updateBadgeCount();
  };

  // This component doesn't render anything
  return null;
};

export default NotificationHandler;
