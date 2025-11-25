import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, useTheme, Searchbar, Chip } from 'react-native-paper';
import OrderCard from '../components/OrderCard';
import apiService from '../services/api';
import { Order } from '../types';
import { AppTheme, spacing } from '../theme/theme';

type FilterStatus = 'all' | 'completed' | 'cancelled';

export default function ExecutorOrdersHistoryScreen() {
  const theme = useTheme<AppTheme>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);

    try {
      const response = await apiService.get('/executor/orders/history');
      if (response.success && response.data) {
        const data = response.data as any;
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders(true);
  };

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus);
    }

    // Search by address or order ID
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => {
        const addressMatch = 
          order.address.city?.toLowerCase().includes(query) ||
          order.address.street?.toLowerCase().includes(query) ||
          order.address.houseNumber?.toLowerCase().includes(query);
        const idMatch = order.id.toLowerCase().includes(query);
        return addressMatch || idMatch;
      });
    }

    return result;
  }, [orders, filterStatus, searchQuery]);

  const renderHeader = () => (
    <View style={styles.header}>
      <Searchbar
        placeholder="Поиск по адресу или номеру заказа"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
        inputStyle={{ color: theme.colors.onSurface }}
        iconColor={theme.colors.primary}
      />
      <View style={styles.filterContainer}>
        <Chip
          selected={filterStatus === 'all'}
          onPress={() => setFilterStatus('all')}
          style={[
            styles.filterChip,
            filterStatus === 'all' && { backgroundColor: theme.colors.primary }
          ]}
          textStyle={[
            styles.filterChipText,
            { color: filterStatus === 'all' ? theme.colors.onPrimary : theme.colors.onSurface }
          ]}
        >
          Все
        </Chip>
        <Chip
          selected={filterStatus === 'completed'}
          onPress={() => setFilterStatus('completed')}
          style={[
            styles.filterChip,
            filterStatus === 'completed' && { backgroundColor: theme.colors.primary }
          ]}
          textStyle={[
            styles.filterChipText,
            { color: filterStatus === 'completed' ? theme.colors.onPrimary : theme.colors.onSurface }
          ]}
        >
          Выполнен
        </Chip>
        <Chip
          selected={filterStatus === 'cancelled'}
          onPress={() => setFilterStatus('cancelled')}
          style={[
            styles.filterChip,
            filterStatus === 'cancelled' && { backgroundColor: theme.colors.primary }
          ]}
          textStyle={[
            styles.filterChipText,
            { color: filterStatus === 'cancelled' ? theme.colors.onPrimary : theme.colors.onSurface }
          ]}
        >
          Отменен
        </Chip>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text 
        variant="titleMedium" 
        style={[styles.emptyTitle, { color: theme.colors.onBackground }]}
      >
        {searchQuery || filterStatus !== 'all' ? 'Ничего не найдено' : 'История пуста'}
      </Text>
      <Text 
        variant="bodyMedium" 
        style={[styles.emptySubtext, { color: theme.custom.textSecondary }]}
      >
        {searchQuery || filterStatus !== 'all' 
          ? 'Попробуйте изменить параметры поиска'
          : 'Выполненные заказы появятся здесь'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => <OrderCard order={item} />}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
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
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    marginBottom: spacing.sm,
    elevation: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipText: {
    fontSize: 12,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    textAlign: 'center',
  },
});
