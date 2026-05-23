import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import apiService from '../services/api';
import { setUser } from '../store/slices/authSlice';
import { RootState } from '../store';
import CustomButton from '../components/CustomButton';
import { AppTheme, spacing } from '../theme';

export default function PendingExecutorApprovalScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const theme = useTheme<AppTheme>();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleCheckStatus = async () => {
    setError('');
    setLoading(true);

    try {
      const response: any = await apiService.get('/auth/me');
      const latestUser = response.data?.user as any;
      const executorProfile = latestUser?.executorProfile || latestUser?.executor_profile;

      dispatch(setUser(latestUser));

      if (latestUser?.role === 'executor' && executorProfile?.is_verified) {
        navigation.reset({ index: 0, routes: [{ name: 'ExecutorTabs' }] });
        return;
      }

      setError('Проверка еще не завершена. Попробуйте позже.');
    } catch (err: any) {
      setError(err.message || 'Не удалось обновить статус аккаунта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.custom.text }]}>
          Аккаунт на проверке
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.custom.textSecondary }]}>
          Код подтверждения принят. Теперь администратор должен проверить ваш аккаунт исполнителя.
        </Text>
        <Text variant="bodySmall" style={[styles.subtitle, { color: theme.custom.textSecondary }]}>
          Ожидаем подтверждение профиля администратором.
        </Text>

        {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handleCheckStatus}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.button}
        >
          Проверить статус
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  error: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
});