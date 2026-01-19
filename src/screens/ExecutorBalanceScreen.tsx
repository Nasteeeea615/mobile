import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import CustomInput from '../components/CustomInput';
import apiService from '../services/api';
import { AppTheme, spacing } from '../theme';

export default function ExecutorBalanceScreen() {
  const [balance, setBalance] = useState(0);
  const [minBalance] = useState(200); // Минимальный баланс для работы
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const navigation = useNavigation<any>();
  const theme = useTheme<AppTheme>();
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setLoadingBalance(true);
    try {
      const response = await apiService.get('/executor/balance');
      if (response.success && response.data) {
        const data = response.data as any;
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 100) {
      Alert.alert('Ошибка', 'Минимальная сумма пополнения 100 ₽');
      return;
    }

    setLoading(true);
    try {
      // Создаем платеж через ЮКассу
      const response = await apiService.post('/executor/deposit', {
        amount,
      });

      if (response.success && response.data) {
        const data = response.data as any;
        // Открываем ссылку на оплату ЮКассы
        if (data.paymentUrl) {
          Alert.alert(
            'Пополнение баланса',
            'Сейчас откроется страница оплаты ЮКасса',
            [
              {
                text: 'Отмена',
                style: 'cancel',
              },
              {
                text: 'Перейти к оплате',
                onPress: () => {
                  // TODO: Открыть WebView или браузер с data.paymentUrl
                  console.log('Payment URL:', data.paymentUrl);
                  Alert.alert('Информация', 'Функция оплаты будет реализована с WebView');
                },
              },
            ]
          );
        }
        setDepositAmount('');
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Не удалось создать платеж');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount < 100) {
      Alert.alert('Ошибка', 'Минимальная сумма вывода 100 ₽');
      return;
    }

    if (amount > balance) {
      Alert.alert('Ошибка', 'Недостаточно средств на балансе');
      return;
    }

    setLoading(true);
    try {
      // Создаем заявку на вывод через ЮКассу
      const response = await apiService.post('/executor/withdraw', {
        amount,
      });

      if (response.success) {
        Alert.alert(
          'Успешно', 
          'Заявка на вывод создана. Средства будут переведены через ЮКассу в течение 1-3 рабочих дней. Вы получите уведомление на email.'
        );
        setWithdrawAmount('');
        fetchBalance();
      }
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Не удалось создать заявку на вывод');
    } finally {
      setLoading(false);
    }
  };

  const canWork = balance >= minBalance;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <View style={styles.content}>
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text variant="labelLarge" style={[styles.balanceLabel, { color: theme.colors.primary }]}>
            Текущий баланс
          </Text>
          <View style={styles.balanceRow}>
            <Text variant="displayMedium" style={[styles.balanceAmount, { color: theme.colors.primary }]}>
              {balance.toFixed(2)}
            </Text>
            <Text variant="headlineMedium" style={[styles.balanceCurrency, { color: theme.colors.primary }]}>
              ₽
            </Text>
          </View>
          
          {!canWork && (
            <View style={[styles.warningBadge, { backgroundColor: theme.colors.errorContainer }]}>
              <Text variant="bodyMedium" style={[styles.warningText, { color: theme.colors.error }]}>
                ⚠ Минимальный баланс для работы: {minBalance} ₽
              </Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <CustomCard style={styles.infoCard}>
          <Text variant="titleMedium" style={[styles.infoTitle, { color: theme.custom.text }]}>
            Как работает баланс
          </Text>
          <Text variant="bodyMedium" style={[styles.infoText, { color: theme.custom.textSecondary }]}>
            • Минимальный баланс для работы: {minBalance} ₽{'\n'}
            • При оплате картой: 10% комиссии компании, 90% на ваш баланс{'\n'}
            • При оплате наличными: 10% списывается с вашего баланса{'\n'}
            • Пополнение и вывод через ЮКассу{'\n'}
            • Вывод средств: 1-3 рабочих дня
          </Text>
        </CustomCard>

        {/* Deposit Section */}
        <CustomCard style={styles.actionCard}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
            Пополнить баланс через ЮКассу
          </Text>
          <Text variant="bodySmall" style={[styles.helperText, { color: theme.custom.textSecondary }]}>
            Оплата производится через защищенный платежный шлюз ЮКасса
          </Text>
          <CustomInput
            label="Сумма пополнения (₽)"
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="numeric"
            placeholder="Минимум 100 ₽"
            disabled={loading}
            style={styles.input}
          />
          <CustomButton
            mode="contained"
            variant="primary"
            onPress={handleDeposit}
            loading={loading}
            disabled={loading || !depositAmount}
            fullWidth
          >
            Перейти к оплате
          </CustomButton>
        </CustomCard>

        {/* Withdraw Section */}
        <CustomCard style={styles.actionCard}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
            Вывести средства через ЮКассу
          </Text>
          <Text variant="bodySmall" style={[styles.helperText, { color: theme.custom.textSecondary }]}>
            Средства будут переведены на ваш счет через ЮКассу. Вы получите уведомление на email.
          </Text>
          <CustomInput
            label="Сумма вывода (₽)"
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            keyboardType="numeric"
            placeholder="Минимум 100 ₽"
            disabled={loading}
            style={styles.input}
          />
          <CustomButton
            mode="contained"
            variant="primary"
            onPress={handleWithdraw}
            loading={loading}
            disabled={loading || !withdrawAmount}
            fullWidth
          >
            Создать заявку на вывод
          </CustomButton>
        </CustomCard>
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
  balanceCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderRadius: 12,
  },
  balanceLabel: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontWeight: '700',
  },
  balanceCurrency: {
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  warningBadge: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
  },
  warningText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoTitle: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  infoText: {
    lineHeight: 22,
  },
  actionCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  helperText: {
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  input: {
    marginBottom: spacing.md,
  },
});
