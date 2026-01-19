import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Chip, useTheme } from 'react-native-paper';
import { Order } from '../types';
import { AppTheme, spacing, shadows } from '../theme';
import CustomCard from './CustomCard';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const theme = useTheme<AppTheme>();

  const getStatusColor = (status: Order['status']) => {
    const isDark = theme.dark;
    // Using black & white theme with different shades for status
    switch (status) {
      case 'pending':
        return isDark ? '#333333' : '#E0E0E0'; // Gray for pending
      case 'assigned':
        return isDark ? '#1A1A1A' : '#F5F5F5'; // Light gray for assigned
      case 'in_progress':
        return isDark ? '#FFFFFF' : '#000000'; // Black/White for in progress
      case 'completed':
        return isDark ? '#4CAF50' : '#4CAF50'; // Green for completed
      case 'cancelled':
        return isDark ? '#666666' : '#CCCCCC'; // Light gray for cancelled
      default:
        return isDark ? '#333333' : '#E0E0E0';
    }
  };

  const getStatusTextColor = (status: Order['status']) => {
    const isDark = theme.dark;
    // Ensure proper contrast for status chip text
    switch (status) {
      case 'pending':
        return isDark ? '#FFFFFF' : '#000000';
      case 'assigned':
        return isDark ? '#FFFFFF' : '#000000';
      case 'in_progress':
        return isDark ? '#000000' : '#FFFFFF';
      case 'completed':
        return '#FFFFFF';
      case 'cancelled':
        return isDark ? '#FFFFFF' : '#000000';
      default:
        return isDark ? '#FFFFFF' : '#000000';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'assigned':
        return 'Назначен';
      case 'in_progress':
        return 'В работе';
      case 'completed':
        return 'Выполнен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  return (
    <CustomCard onPress={onPress} style={styles.card} elevation="medium">
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            variant="titleMedium"
            style={[
              styles.title,
              {
                color: theme.colors.onSurface,
                fontWeight: theme.typography.fontWeights.semibold,
              },
            ]}
          >
            {formatDate(order.scheduledDate)} в {order.scheduledTime}
          </Text>
          <Chip
            style={[
              styles.statusChip,
              {
                backgroundColor: getStatusColor(order.status),
              },
            ]}
            textStyle={[
              styles.statusText,
              { color: getStatusTextColor(order.status) },
            ]}
          >
            {getStatusText(order.status)}
          </Chip>
        </View>

        <View style={styles.details}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            Адрес: {order.address.city}, {order.address.street}, {order.address.houseNumber}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            Объем: {order.vehicleCapacity} м³
          </Text>
          <Text
            variant="titleMedium"
            style={[
              styles.price,
              {
                color: theme.colors.onSurface,
                fontWeight: theme.typography.fontWeights.bold,
              },
            ]}
          >
            Стоимость: {order.price} ₽
          </Text>
        </View>

        {order.executor && (
          <Text variant="bodySmall" style={[styles.executor, { color: theme.custom.textSecondary }]}>
            Исполнитель: {order.executor.name}
          </Text>
        )}
      </View>
    </CustomCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md, // 16px - following 8px grid
  },
  content: {
    padding: spacing.md, // 16px - following 8px grid
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm, // 8px - following 8px grid
  },
  title: {},
  statusChip: {
    height: 32, // Increased for better touch target
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    marginTop: spacing.sm, // 8px - following 8px grid
    gap: spacing.sm, // 8px - following 8px grid
  },
  price: {
    marginTop: spacing.sm, // 8px - following 8px grid
  },
  executor: {
    marginTop: spacing.sm, // 8px - following 8px grid
  },
});
