import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AppTheme, spacing, borderRadius, containerShadows } from '../theme/theme';
import apiService from '../services/api';
import { Order } from '../types';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation<any>();
  const theme = useTheme<AppTheme>();

  const fetchOrders = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError('');

    try {
      const response = await apiService.get('/orders/history');

      if (response.success && response.data) {
        const data = response.data as any;
        const fetchedOrders = data.orders || [];
        
        // Filter completed and cancelled orders
        const historyOrders = fetchedOrders.filter(
          (order: Order) => order.status === 'completed' || order.status === 'cancelled'
        );
        
        // Sort by date (newest first)
        const sortedOrders = historyOrders.sort((a: Order, b: Order) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        
        setOrders(sortedOrders);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки истории заказов');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders(true);
  };

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderDetails', { orderId: order.id });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Выполнен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.custom.text;
      case 'cancelled':
        return theme.custom.textSecondary;
      default:
        return theme.custom.text;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const address = typeof item.address === 'object' 
      ? `${item.address.city}, ${item.address.street}, ${item.address.houseNumber}`
      : item.address || 'Адрес не указан';

    return (
      <TouchableOpacity
        style={[
          styles.orderCard,
          {
            backgroundColor: theme.custom.surface,
            borderColor: theme.custom.border,
          },
          containerShadows.card,
        ]}
        onPress={() => handleOrderPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <Text
            variant="titleMedium"
            style={[styles.orderDate, { color: theme.custom.text }]}
          >
            {formatDate(item.createdAt)}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.orderStatus, { color: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>

        <Text
          variant="bodyMedium"
          style={[styles.orderAddress, { color: theme.custom.textSecondary }]}
          numberOfLines={2}
        >
          {address}
        </Text>

        <View style={styles.orderFooter}>
          <Text
            variant="bodySmall"
            style={[styles.orderCapacity, { color: theme.custom.textSecondary }]}
          >
            {item.vehicleCapacity} м³
          </Text>
          <Text
            variant="titleMedium"
            style={[styles.orderPrice, { color: theme.custom.text }]}
          >
            {item.price} ₽
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text
        variant="titleMedium"
        style={[styles.emptyTitle, { color: theme.custom.text }]}
      >
        Нет завершенных заказов
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.emptySubtext, { color: theme.custom.textSecondary }]}
      >
        Завершенные заказы появятся здесь
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.custom.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.error, { color: theme.custom.text }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.custom.primary}
            colors={[theme.custom.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  list: {
    padding: spacing.md,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  orderCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderDate: {
    fontWeight: '600',
  },
  orderStatus: {
    fontWeight: '500',
  },
  orderAddress: {
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCapacity: {
    fontWeight: '500',
  },
  orderPrice: {
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    textAlign: 'center',
  },
  error: {
    textAlign: 'center',
  },
});
