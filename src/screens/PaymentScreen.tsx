import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Checkbox, Card, RadioButton, ActivityIndicator, useTheme } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import apiService from '../services/api';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { AppTheme, spacing, containerShadows } from '../theme';

export default function PaymentScreen() {
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Payment method selection
  const [paymentType, setPaymentType] = useState<'new_card' | 'saved_card'>('new_card');
  const [savedMethods, setSavedMethods] = useState<any[]>([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState<string>('');

  // New card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // Order details
  const [order, setOrder] = useState<any>(null);

  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const theme = useTheme<AppTheme>();
  const orderId = route.params?.orderId;

  useEffect(() => {
    fetchOrderDetails();
    fetchSavedMethods();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await apiService.get(`/orders/${orderId}`);
      if (response.success && response.data) {
        const data = response.data as any;
        setOrder(data.order);
      }
    } catch (err: any) {
      setError('Ошибка загрузки заказа');
    }
  };

  const fetchSavedMethods = async () => {
    setLoadingMethods(true);
    try {
      const response = await apiService.get('/payments/methods');
      if (response.success && response.data) {
        const data = response.data as any;
        setSavedMethods(data.methods || []);
        if (data.methods && data.methods.length > 0) {
          setPaymentType('saved_card');
          setSelectedSavedCard(data.methods[0].cardToken);
        }
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoadingMethods(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    setError('');

    if (paymentType === 'new_card') {
      // Validate new card
      if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
        setError('Заполните все поля карты');
        return;
      }

      if (cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Неверный номер карты');
        return;
      }

      if (cardCvv.length !== 3) {
        setError('Неверный CVV');
        return;
      }
    } else {
      // Validate saved card selection
      if (!selectedSavedCard) {
        setError('Выберите сохраненную карту');
        return;
      }
    }

    setLoading(true);

    try {
      const paymentMethod =
        paymentType === 'new_card'
          ? {
              type: 'card',
              cardNumber: cardNumber.replace(/\s/g, ''),
              cardExpiry,
              cardCvv,
              cardHolder,
              cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
              cardToken: `token_${Date.now()}`, // In production, get from payment gateway
            }
          : {
              type: 'saved_card',
              cardToken: selectedSavedCard,
            };

      const response = await apiService.post(`/orders/${orderId}/pay`, {
        paymentMethod,
        saveCard: paymentType === 'new_card' ? saveCard : false,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigation.navigate('MyOrders');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка оплаты');
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.custom.background }]}>
        <ActivityIndicator size="large" color={theme.custom.primary} />
      </View>
    );
  }

  if (success) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.custom.background }]}>
        <Text variant="headlineMedium" style={[styles.successText, { color: theme.custom.text }]}>
          ✓ Оплата успешна!
        </Text>
        <Text variant="bodyMedium" style={[styles.successSubtext, { color: theme.custom.textSecondary }]}>
          Спасибо за использование нашего сервиса
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.custom.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.orderCard, { backgroundColor: theme.custom.surface }, containerShadows.card]}>
          <Card.Content>
            <Text variant="titleLarge" style={{ color: theme.custom.text }}>
              Оплата заказа
            </Text>
            <Text variant="bodyLarge" style={[styles.amount, { color: theme.custom.text }]}>
              Сумма: {order.price} ₽
            </Text>
            <Text variant="bodyMedium" style={[styles.orderDetails, { color: theme.custom.textSecondary }]}>
              Заказ #{order.id.slice(0, 8)}
            </Text>
          </Card.Content>
        </Card>

        {!loadingMethods && savedMethods.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
              Способ оплаты
            </Text>
            <RadioButton.Group
              onValueChange={value => setPaymentType(value as any)}
              value={paymentType}
            >
              <RadioButton.Item
                label="Сохраненная карта"
                value="saved_card"
                color={theme.custom.primary}
              />
              <RadioButton.Item label="Новая карта" value="new_card" color={theme.custom.primary} />
            </RadioButton.Group>
          </View>
        )}

        {paymentType === 'saved_card' && savedMethods.length > 0 ? (
          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
              Выберите карту
            </Text>
            <RadioButton.Group
              onValueChange={value => setSelectedSavedCard(value)}
              value={selectedSavedCard}
            >
              {savedMethods.map((method, index) => (
                <RadioButton.Item
                  key={index}
                  label={`•••• ${method.cardLast4}`}
                  value={method.cardToken}
                  color={theme.custom.primary}
                />
              ))}
            </RadioButton.Group>
          </View>
        ) : (
          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
              Данные карты
            </Text>

            <CustomInput
              label="Номер карты"
              value={cardNumber}
              onChangeText={text => setCardNumber(formatCardNumber(text))}
              keyboardType="numeric"
              placeholder="1234 5678 9012 3456"
              disabled={loading}
              style={styles.input}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <CustomInput
                  label="Срок действия"
                  value={cardExpiry}
                  onChangeText={text => setCardExpiry(formatExpiry(text))}
                  keyboardType="numeric"
                  placeholder="MM/YY"
                  disabled={loading}
                />
              </View>

              <View style={styles.halfInput}>
                <CustomInput
                  label="CVV"
                  value={cardCvv}
                  onChangeText={setCardCvv}
                  keyboardType="numeric"
                  placeholder="123"
                  secureTextEntry
                  disabled={loading}
                />
              </View>
            </View>

            <CustomInput
              label="Имя держателя"
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="IVAN IVANOV"
              autoCapitalize="characters"
              disabled={loading}
              style={styles.input}
            />

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={saveCard ? 'checked' : 'unchecked'}
                onPress={() => setSaveCard(!saveCard)}
                disabled={loading}
                color={theme.custom.primary}
              />
              <Text style={[styles.checkboxLabel, { color: theme.custom.text }]}>
                Сохранить карту для будущих платежей
              </Text>
            </View>
          </View>
        )}

        {error ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
        ) : null}

        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handlePayment}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.payButton}
        >
          {`Оплатить ${order.price} ₽`}
        </CustomButton>

        <Text variant="bodySmall" style={[styles.secureNote, { color: theme.custom.textSecondary }]}>
          🔒 Безопасная оплата. Данные карты защищены
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: spacing.lg,
  },
  orderCard: {
    marginBottom: spacing.lg,
    borderRadius: 8,
  },
  amount: {
    marginTop: spacing.md,
    fontWeight: 'bold',
  },
  orderDetails: {
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  error: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  payButton: {
    marginTop: spacing.md,
  },
  secureNote: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  successText: {
    marginBottom: spacing.md,
  },
  successSubtext: {
    textAlign: 'center',
  },
});
