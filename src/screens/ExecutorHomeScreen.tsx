import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, AppState, Alert } from 'react-native';
import { Text, ActivityIndicator, FAB, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import OrderCard from '../components/OrderCard';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomButton from '../components/CustomButton';
import apiService from '../services/api';
import { Order } from '../types';
import { AppTheme, spacing, containerShadows } from '../theme';
import { InactivityTimer } from '../utils/inactivityTimer';

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

  const navigation = useNavigation<any>();
  const theme = useTheme<AppTheme>();
  const inactivityTimerRef = useRef<InactivityTimer | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    fetchActiveOrder();

    // Setup app state listener for inactivity tracking
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground - reset timer
        if (isWorking && inactivityTimerRef.current) {
          inactivityTimerRef.current.reset();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (inactivityTimerRef.current) {
        inactivityTimerRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (isWorking) {
      // Start inactivity timer when work begins
      if (!inactivityTimerRef.current) {
        inactivityTimerRef.current = new InactivityTimer(handleInactivityTimeout, 30);
        inactivityTimerRef.current.start();
      }

      fetchAvailableOrders();
      const interval = setInterval(() => {
        fetchAvailableOrders();
        // Reset timer on each fetch (activity indicator)
        if (inactivityTimerRef.current) {
          inactivityTimerRef.current.reset();
        }
      }, 10000); // Refresh every 10 seconds
      
      return () => {
        clearInterval(interval);
      };
    } else {
      // Stop timer when work ends
      if (inactivityTimerRef.current) {
        inactivityTimerRef.current.stop();
        inactivityTimerRef.current = null;
      }
    }
  }, [isWorking]);

  const handleInactivityTimeout = async () => {
    Alert.alert(
      'Работа завершена',
      'Вы были неактивны более 30 минут. Работа автоматически завершена.',
      [{ text: 'OK' }]
    );
    
    try {
      await apiService.post('/executor/stop-work');
      setIsWorking(false);
      setAvailableOrders([]);
    } catch (error) {
      console.error('Error auto-stopping work:', error);
    }
  };

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
      console.error('Error fetching active order:', error);
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
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      fetchAvailableOrders();
    } catch (error: any) {
      alert(error.message || 'Ошибка начала работы');
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
    } catch (error: any) {
      alert(error.message || 'Ошибка завершения работы');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = (order: Order) => {
    // Reset inactivity timer on user action
    if (inactivityTimerRef.current) {
      inactivityTimerRef.current.reset();
    }
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
        // Reset timer after accepting order
        if (inactivityTimerRef.current) {
          inactivityTimerRef.current.reset();
        }
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка принятия заказа');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = () => {
    // Reset inactivity timer on user action
    if (inactivityTimerRef.current) {
      inactivityTimerRef.current.reset();
    }
    setShowCompleteModal(true);
  };

  const confirmCompleteOrder = async () => {
    if (!activeOrder) return;

    setLoading(true);
    try {
      await apiService.post(`/executor/orders/${activeOrder.id}/complete`);
      setActiveOrder(null);
      setShowCompleteModal(false);
      fetchAvailableOrders();
      // Reset timer after completing order
      if (inactivityTimerRef.current) {
        inactivityTimerRef.current.reset();
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка завершения заказа');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    // Reset inactivity timer on user action
    if (inactivityTimerRef.current) {
      inactivityTimerRef.current.reset();
    }
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
        
        <View style={[styles.activeOrderDetails, { backgroundColor: theme.custom.surface }, containerShadows.card]}>
          <Text variant="titleMedium" style={{ color: theme.custom.text }}>
            Детали заказа:
          </Text>
          <Text variant="bodyLarge" style={[styles.detailText, { color: theme.custom.text }]}>
            📍 {activeOrder.address.city}, {activeOrder.address.street}, {activeOrder.address.houseNumber}
          </Text>
          <Text variant="bodyLarge" style={[styles.detailText, { color: theme.custom.text }]}>
            💰 {activeOrder.price} ₽
          </Text>
          {activeOrder.comment && (
            <Text variant="bodyMedium" style={[styles.comment, { color: theme.custom.textSecondary }]}>
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
          <Text variant="bodyMedium" style={[styles.emptySubtext, { color: theme.custom.textSecondary }]}>
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
            console.error('Failed to navigate to ExecutorHistory:', error);
            // Fallback: try to navigate to the tab navigator root
            try {
              navigation.navigate('ExecutorTabs', { screen: 'ExecutorHistory' });
            } catch (fallbackError) {
              console.error('Fallback navigation also failed:', fallbackError);
            }
          }
        }}
      />

      <ConfirmationModal
        visible={showAcceptModal}
        title="Принять заказ"
        message={`Принять заказ на ${selectedOrder?.address.city}, ${selectedOrder?.address.street}?`}
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
