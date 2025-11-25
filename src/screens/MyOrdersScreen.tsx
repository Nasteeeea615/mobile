import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setOrders } from '../store/slices/orderSlice';
import OrderCard from '../components/OrderCard';
import apiService from '../services/api';
import { Order } from '../types';
import { AppTheme, spacing } from '../theme';

export default function MyOrdersScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const theme = useTheme<AppTheme>();
  const orders: Order[] = useSelector((state: any) => state.order.orders || []);

  const fetchOrders = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError('');

    try {
      const response = await apiService.get('/orders/my');

      if (response.success && response.data) {
        const data = response.data as any;
        dispatch(setOrders(data.orders || []));
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки заказов');
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

  const getActiveOrder = (): Order | undefined => {
    return orders.find(
      (order: Order) => order.status === 'assigned' || order.status === 'in_progress'
    );
  };

  const getCompletedOrders = (): Order[] => {
    return orders.filter((order: Order) => order.status === 'completed' || order.status === 'cancelled');
  };

  const renderActiveOrder = () => {
    const activeOrder = getActiveOrder();

    if (!activeOrder) return null;

    return (
      <View style={styles.section}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.custom.text }]}>
          Текущий заказ
        </Text>
        <OrderCard order={activeOrder} onPress={() => handleOrderPress(activeOrder)} />
      </View>
    );
  };

  const renderCompletedOrders = () => {
    const completedOrders = getCompletedOrders();

    if (completedOrders.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.custom.text }]}>
          История заказов
        </Text>
        {completedOrders.map((order: Order) => (
          <OrderCard key={order.id} order={order} onPress={() => handleOrderPress(order)} />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.custom.background }]}>
        <ActivityIndicator size="large" color={theme.custom.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.custom.background }]}>
        <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.custom.background }]}>
        <Text variant="titleMedium" style={{ color: theme.custom.text }}>
          У вас пока нет заказов
        </Text>
        <Text variant="bodyMedium" style={[styles.emptySubtext, { color: theme.custom.textSecondary }]}>
          Создайте свой первый заказ на главной странице
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={[1]} // Dummy data to use FlatList with custom content
      renderItem={() => (
        <View style={[styles.container, { backgroundColor: theme.custom.background }]}>
          {renderActiveOrder()}
          {renderCompletedOrders()}
        </View>
      )}
      keyExtractor={() => 'orders'}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.custom.primary}
        />
      }
      style={{ backgroundColor: theme.custom.background }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  error: {
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
