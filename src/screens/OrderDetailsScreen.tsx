import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Divider, useTheme, Chip } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import apiService from '../services/api';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import { AppTheme, spacing, containerShadows } from '../theme';

export default function OrderDetailsScreen() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');

  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const theme = useTheme<AppTheme>();
  const orderId = route.params?.orderId;

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.get(`/orders/${orderId}`);

      if (response.success && response.data) {
        const data = response.data as any;
        setOrder(data.order);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки деталей заказа');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает назначения';
      case 'accepted':
        return 'Принят исполнителем';
      case 'in_progress':
        return 'В работе';
      case 'completed':
        return 'Выполнен';
      case 'awaiting_payment':
        return 'Ожидает оплаты';
      case 'paid':
        return 'Оплачен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500'; // Orange
      case 'accepted':
        return '#2196F3'; // Blue
      case 'in_progress':
        return '#2196F3'; // Blue
      case 'completed':
        return '#4CAF50'; // Green
      case 'awaiting_payment':
        return '#FF9800'; // Amber
      case 'paid':
        return '#4CAF50'; // Green
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return theme.custom.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'clock-outline';
      case 'accepted':
        return 'check-circle-outline';
      case 'in_progress':
        return 'truck-fast';
      case 'completed':
        return 'check-circle';
      case 'awaiting_payment':
        return 'credit-card-clock-outline';
      case 'paid':
        return 'check-all';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'information';
    }
  };

  const handlePayment = () => {
    navigation.navigate('Payment', { orderId: order.id });
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.custom.background }]}>
        <ActivityIndicator size="large" color={theme.custom.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.custom.background }]}>
        <Text style={[styles.error, { color: theme.colors.error }]}>{error || 'Заказ не найден'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <View style={styles.content}>
        {/* Price Card */}
        <View style={[styles.priceCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text variant="labelLarge" style={[styles.priceLabel, { color: theme.colors.primary }]}>
            Стоимость
          </Text>
          <View style={styles.priceRow}>
            <Text variant="displayMedium" style={[styles.priceAmount, { color: theme.colors.primary }]}>
              {order.price}
            </Text>
            <Text variant="headlineMedium" style={[styles.priceCurrency, { color: theme.colors.primary }]}>
              ₽
            </Text>
          </View>
          {order.payment_status === 'paid' && (
            <View style={styles.paidBadge}>
              <Text variant="bodyMedium" style={[styles.paidText, { color: '#4CAF50' }]}>
                ✓ Оплачено
              </Text>
            </View>
          )}
        </View>

        {/* Address Card */}
        <CustomCard style={styles.infoCard}>
          <Text variant="labelLarge" style={[styles.cardLabel, { color: theme.custom.textSecondary }]}>
            Адрес
          </Text>
          <Text variant="bodyLarge" style={[styles.cardContent, { color: theme.custom.text }]}>
            {order.address?.city || order.city}, {order.address?.street || order.street}, {order.address?.houseNumber || order.house_number}
          </Text>
        </CustomCard>

        {/* Date & Time Card */}
        <CustomCard style={styles.infoCard}>
          <Text variant="labelLarge" style={[styles.cardLabel, { color: theme.custom.textSecondary }]}>
            Дата и время
          </Text>
          <Text variant="bodyLarge" style={[styles.cardContent, { color: theme.custom.text }]}>
            {formatDate(order.scheduled_date)} в {order.scheduled_time}
          </Text>
        </CustomCard>

        {/* Vehicle Capacity Card */}
        <CustomCard style={styles.infoCard}>
          <Text variant="labelLarge" style={[styles.cardLabel, { color: theme.custom.textSecondary }]}>
            Объем машины
          </Text>
          <Text variant="bodyLarge" style={[styles.cardContent, { color: theme.custom.text }]}>
            {order.vehicle_capacity} м³
          </Text>
        </CustomCard>

        {/* Comment Card */}
        {order.comment && (
          <CustomCard style={styles.infoCard}>
            <Text variant="labelLarge" style={[styles.cardLabel, { color: theme.custom.textSecondary }]}>
              Комментарий
            </Text>
            <Text variant="bodyMedium" style={[styles.cardContent, { color: theme.custom.text }]}>
              {order.comment}
            </Text>
          </CustomCard>
        )}

        {/* Executor Card */}
        {(order.executor_name || order.executor) && (
          <CustomCard style={styles.infoCard}>
            <Text variant="labelLarge" style={[styles.cardLabel, { color: theme.custom.textSecondary }]}>
              Исполнитель
            </Text>
            <Text variant="bodyLarge" style={[styles.cardContent, { color: theme.custom.text }]}>
              {order.executor_name || order.executor?.name}
            </Text>
            {(order.executor_phone || order.executor?.phone_number) && (
              <Text variant="bodyMedium" style={[styles.cardSubContent, { color: theme.custom.textSecondary }]}>
                Телефон: {order.executor_phone || order.executor?.phone_number}
              </Text>
            )}
            {order.vehicle_number && (
              <Text variant="bodyMedium" style={[styles.cardSubContent, { color: theme.custom.textSecondary }]}>
                Номер машины: {order.vehicle_number}
              </Text>
            )}
          </CustomCard>
        )}

        {/* Timestamps */}
        <View style={[styles.timestampCard, { backgroundColor: theme.custom.surface }]}>
          <Text variant="bodySmall" style={[styles.timestampText, { color: theme.custom.textSecondary }]}>
            Создан: {new Date(order.created_at || order.createdAt).toLocaleString('ru-RU')}
          </Text>
          {order.completed_at && (
            <Text variant="bodySmall" style={[styles.timestampText, { color: theme.custom.textSecondary }]}>
              Выполнен: {new Date(order.completed_at).toLocaleString('ru-RU')}
            </Text>
          )}
          {order.paid_at && (
            <Text variant="bodySmall" style={[styles.timestampText, { color: theme.custom.textSecondary }]}>
              Оплачен: {new Date(order.paid_at).toLocaleString('ru-RU')}
            </Text>
          )}
        </View>

        {/* Payment Button */}
        {(order.status === 'in_progress' || order.status === 'awaiting_payment' || order.status === 'completed') && 
         order.payment_status !== 'paid' && (
          <CustomButton
            mode="contained"
            variant="primary"
            onPress={handlePayment}
            loading={paymentLoading}
            disabled={paymentLoading}
            style={styles.paymentButton}
          >
            Оплатить заказ
          </CustomButton>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  priceCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderRadius: 12,
    ...containerShadows.card,
  },
  priceLabel: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  priceAmount: {
    fontWeight: '700',
  },
  priceCurrency: {
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  paidBadge: {
    marginTop: spacing.sm,
  },
  paidText: {
    fontWeight: '600',
  },
  infoCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardLabel: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  cardContent: {
    lineHeight: 24,
  },
  cardSubContent: {
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  timestampCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 8,
    ...containerShadows.card,
  },
  timestampText: {
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  paymentButton: {
    marginTop: spacing.md,
  },
  error: {
    textAlign: 'center',
  },
});
