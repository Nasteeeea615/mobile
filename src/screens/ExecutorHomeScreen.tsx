import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, FAB, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import OrderCard from '../components/OrderCard';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomButton from '../components/CustomButton';
import { useSnackbarHelpers } from '../components/SnackbarProvider';
import apiService from '../services/api';
import { Order } from '../types';
import { AppTheme, spacing, containerShadows } from '../theme';

export default function ExecutorHomeScreen() {
  const [isWorking, setIsWorking] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showStartWorkModal, setShowStartWorkModal] = useState(false);
  const [showStopWorkModal, setShowStopWorkModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [executorBalance, setExecutorBalance] = useState(0);

  const navigation = useNavigation<any>();
  const theme = useTheme<AppTheme>();
  const { showError, showWarning, showSuccess } = useSnackbarHelpers();

  useEffect(() => {
    fetchActiveOrder();
    fetchBalance();
  }, []);

  useEffect(() => {
    if (isWorking) {
      fetchAvailableOrders();
      const interval = setInterval(() => {
        fetchAvailableOrders();
      }, 10000); // Refresh every 10 seconds

      return () => {
        clearInterval(interval);
      };
    }
  }, [isWorking]);

  const fetchActiveOrder = async () => {
    try {
      const response = await apiService.get('/executor/orders/active');
      if (response.success && response.data) {
        const data = response.data as any;
        if (data.order) {
          setActiveOrder(data.order);
          setIsWorking(true);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки активного заказа:', error);
    }
  };

  const fetchAvailableOrders = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);

    try {
      const response = await apiService.get('/executor/orders');
      if (response.success && response.data) {
        const data = response.data as any;
        setAvailableOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await apiService.get('/executor/balance');
      if (response.success && response.data) {
        const data = response.data as any;
        setExecutorBalance(Number(data.balance || 0));
      }
    } catch (error) {
      console.error('Ошибка загрузки баланса исполнителя:', error);
    }
  };

  const handleStartWork = () => {
    setShowStartWorkModal(true);
  };

  const confirmStartWork = async () => {
    setLoading(true);
    try {
      await apiService.post('/executor/start-work');
      setIsWorking(true);
      setShowStartWorkModal(false);
      showSuccess('Вы на линии — будут приходить новые заказы');
      fetchBalance();
      fetchAvailableOrders();
    } catch (error: any) {
      showError(error.message || 'Ошибка начала работы');
    } finally {
      setLoading(false);
    }
  };

  const handleStopWork = () => {
    setShowStopWorkModal(true);
  };

  const confirmStopWork = async () => {
    setLoading(true);
    try {
      await apiService.post('/executor/stop-work');
      setIsWorking(false);
      setAvailableOrders([]);
      setShowStopWorkModal(false);
      showSuccess('Вы завершили работу');
    } catch (error: any) {
      showError(error.message || 'Ошибка завершения работы');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowAcceptModal(true);
  };

  const confirmAcceptOrder = async () => {
    if (!selectedOrder) return;

    setLoading(true);
    try {
      const response = await apiService.post(`/executor/orders/${selectedOrder.id}/accept`);
      if (response.success && response.data) {
        const data = response.data as any;
        setActiveOrder(data.order);
        setAvailableOrders([]);
        setShowAcceptModal(false);
      }
    } catch (error: any) {
      showError(error.message || 'Ошибка принятия заказа');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = () => {
    setShowCompleteModal(true);
  };

  const confirmCompleteOrder = async () => {
    if (!activeOrder) return;

    setLoading(true);
    try {
      await apiService.post(`/executor/orders/${activeOrder.id}/complete`);
      setActiveOrder(null);
      setShowCompleteModal(false);
      fetchBalance();
      fetchAvailableOrders();
    } catch (error: any) {
      showError(error.message || 'Ошибка завершения заказа');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (isWorking) {
      fetchAvailableOrders(true);
    } else {
      setRefreshing(false);
    }
  };

  if (!isWorking && !activeOrder) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.custom.background }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.custom.text }]}>
          Начните работу
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.custom.textSecondary }]}>
          Нажмите кнопку ниже, чтобы начать принимать заказы
        </Text>
        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handleStartWork}
          loading={loading}
          disabled={loading}
          style={styles.startButton}
        >
          Начать работу
        </CustomButton>
      </View>
    );
  }

  if (activeOrder) {
    return (
      <View style={[styles.container, { backgroundColor: theme.custom.background }]}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.custom.text }]}>
          Активный заказ
        </Text>
        <OrderCard order={activeOrder} />

        <View
          style={[
            styles.activeOrderDetails,
            { backgroundColor: theme.custom.surface },
            containerShadows.card,
          ]}
        >
          <Text variant="titleMedium" style={{ color: theme.custom.text }}>
            Детали заказа:
          </Text>
          <Text variant="bodyLarge" style={[styles.detailText, { color: theme.custom.text }]}>
            📍 {activeOrder.address?.city || '—'}, {activeOrder.address?.street || '—'},{' '}
            {activeOrder.address?.houseNumber || '—'}
          </Text>
          <Text variant="bodyLarge" style={[styles.detailText, { color: theme.custom.text }]}>
            💰 {activeOrder.price} ₽
          </Text>
          {activeOrder.comment && (
            <Text
              variant="bodyMedium"
              style={[styles.comment, { color: theme.custom.textSecondary }]}
            >
              Комментарий: {activeOrder.comment}
            </Text>
          )}
        </View>

        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handleCompleteOrder}
          disabled={loading}
          fullWidth
          style={styles.completeButton}
        >
          Выполнено
        </CustomButton>

        <CustomButton
          mode="outlined"
          variant="secondary"
          onPress={handleStopWork}
          disabled={loading}
          fullWidth
          style={styles.stopButton}
        >
          Закончить работу
        </CustomButton>

        <ConfirmationModal
          visible={showCompleteModal}
          title="Завершить заказ"
          message="Вы уверены, что заказ выполнен?"
          onConfirm={confirmCompleteOrder}
          onCancel={() => setShowCompleteModal(false)}
          loading={loading}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <View
        style={[
          styles.balanceBadge,
          { backgroundColor: theme.custom.surface, borderColor: theme.custom.border },
        ]}
      >
        <Text variant="bodyMedium" style={{ color: theme.custom.text }}>
          Баланс: {executorBalance.toFixed(2)} ₽
        </Text>
        {executorBalance <= 0 ? (
          <Text variant="bodySmall" style={{ color: theme.custom.warning }}>
            Пополните баланс безналичными заказами или выведите средства
          </Text>
        ) : null}
      </View>

      <CustomButton
        mode="outlined"
        variant="secondary"
        onPress={handleStopWork}
        disabled={loading}
        fullWidth
        style={styles.stopWorkButton}
      >
        Закончить работу
      </CustomButton>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.custom.primary} />
        </View>
      ) : availableOrders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text variant="titleMedium" style={{ color: theme.custom.text }}>
            Нет доступных заказов
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.emptySubtext, { color: theme.custom.textSecondary }]}
          >
            Ожидайте новых заказов
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableOrders}
          renderItem={({ item }) => (
            <View style={styles.orderItem}>
              <OrderCard order={item} />
              <CustomButton
                mode="contained"
                variant="primary"
                onPress={() => handleAcceptOrder(item)}
                disabled={executorBalance <= 0 || loading}
                fullWidth
                style={styles.acceptButton}
              >
                Принять заказ
              </CustomButton>
            </View>
          )}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.custom.primary}
            />
          }
          style={{ backgroundColor: theme.custom.background }}
        />
      )}

      <FAB
        icon="history"
        style={[styles.fab, { backgroundColor: theme.custom.primary }]}
        color={theme.custom.buttonPrimaryText}
        onPress={() => {
          try {
            navigation.navigate('ExecutorHistory');
          } catch (error) {
            console.error('Ошибка перехода в историю заказов:', error);
            // Fallback: try to navigate to the tab navigator root
            try {
              navigation.navigate('ExecutorTabs', { screen: 'ExecutorHistory' });
            } catch (fallbackError) {
              console.error('Резервный переход также не сработал:', fallbackError);
            }
          }
        }}
      />

      <ConfirmationModal
        visible={showAcceptModal}
        title="Принять заказ"
        message={`Принять заказ в городе ${selectedOrder?.address?.city || 'неизвестно'}?`}
        onConfirm={confirmAcceptOrder}
        onCancel={() => setShowAcceptModal(false)}
        loading={loading}
      />

      <ConfirmationModal
        visible={showStartWorkModal}
        title="Начать работу"
        message="Вы уверены, что хотите начать работу? Вы начнете получать доступные заказы."
        onConfirm={confirmStartWork}
        onCancel={() => setShowStartWorkModal(false)}
        confirmText="Начать"
        loading={loading}
      />

      <ConfirmationModal
        visible={showStopWorkModal}
        title="Закончить работу"
        message="Вы уверены, что хотите закончить работу? Вы перестанете получать новые заказы."
        onConfirm={confirmStopWork}
        onCancel={() => setShowStopWorkModal(false)}
        confirmText="Закончить"
        loading={loading}
      />
    </View>
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
  stopWorkButton: {
    marginBottom: spacing.lg,
  },
  balanceBadge: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  startButton: {
    marginTop: spacing.lg,
  },
  activeOrderDetails: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 8,
  },
  detailText: {
    marginTop: spacing.md,
  },
  comment: {
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  completeButton: {
    marginTop: spacing.lg,
  },
  stopButton: {
    marginTop: spacing.md,
  },
  orderItem: {
    marginBottom: spacing.md,
  },
  acceptButton: {
    marginTop: spacing.md,
  },
  emptySubtext: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
  },
});
