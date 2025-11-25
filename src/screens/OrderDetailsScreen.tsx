import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, ActivityIndicator, Divider, useTheme } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import apiService from '../services/api';
import { AppTheme, spacing, containerShadows } from '../theme';

export default function OrderDetailsScreen() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const route = useRoute<any>();
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
      case 'assigned':
        return 'Назначен исполнитель';
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
      <Card style={[styles.card, { backgroundColor: theme.custom.surface }, containerShadows.card]}>
        <Card.Content>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.custom.text }]}>
            Заказ #{order.id.slice(0, 8)}
          </Text>

          <Divider style={[styles.divider, { backgroundColor: theme.custom.divider }]} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.textSecondary }]}>
              Статус
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.custom.text }}>
              {getStatusText(order.status)}
            </Text>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.custom.divider }]} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.textSecondary }]}>
              Адрес
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.custom.text }}>
              {order.city}, {order.street}, {order.house_number}
            </Text>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.custom.divider }]} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.textSecondary }]}>
              Дата и время
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.custom.text }}>
              {formatDate(order.scheduled_date)} в {order.scheduled_time}
            </Text>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.custom.divider }]} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.textSecondary }]}>
              Объем машины
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.custom.text }}>
              {order.vehicle_capacity} м³
            </Text>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.custom.divider }]} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.textSecondary }]}>
              Стоимость
            </Text>
            <Text variant="headlineSmall" style={[styles.price, { color: theme.custom.text }]}>
              {order.price} ₽
            </Text>
          </View>

          {order.comment && (
            <>
              <Divider style={[styles.divider, { backgroundColor: theme.custom.divider }]} />
              <View style={styles.section}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.textSecondary }]}>
                  Комментарий
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.custom.text }}>
                  {order.comment}
                </Text>
              </View>
            </>
          )}

          {order.executor && (
            <>
              <Divider style={[styles.divider, { backgroundColor: theme.custom.divider }]} />
              <View style={styles.section}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.textSecondary }]}>
                  Исполнитель
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.custom.text }}>
                  {order.executor.name}
                </Text>
                <Text variant="bodyMedium" style={[styles.phone, { color: theme.custom.textSecondary }]}>
                  {order.executor.phone_number}
                </Text>
              </View>
            </>
          )}

          <Divider style={[styles.divider, { backgroundColor: theme.custom.divider }]} />

          <View style={styles.section}>
            <Text variant="bodySmall" style={[styles.timestamp, { color: theme.custom.textSecondary }]}>
              Создан: {new Date(order.created_at).toLocaleString('ru-RU')}
            </Text>
            {order.completed_at && (
              <Text variant="bodySmall" style={[styles.timestamp, { color: theme.custom.textSecondary }]}>
                Выполнен: {new Date(order.completed_at).toLocaleString('ru-RU')}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
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
  card: {
    margin: spacing.md,
    borderRadius: 8,
  },
  title: {
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  section: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  divider: {
    marginVertical: spacing.md,
  },
  price: {
    fontWeight: 'bold',
  },
  phone: {
    marginTop: spacing.xs,
  },
  timestamp: {
    marginTop: spacing.xs,
  },
  error: {
    textAlign: 'center',
  },
});
