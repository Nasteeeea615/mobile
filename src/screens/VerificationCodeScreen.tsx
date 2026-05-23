import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import apiService from '../services/api';
import { setUser, setToken } from '../store/slices/authSlice';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { AppTheme, spacing } from '../theme';

export default function VerificationCodeScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const theme = useTheme<AppTheme>();

  const email = route.params?.email || '';
  const role = route.params?.role;

  const handleVerify = async () => {
    setError('');

    if (!email) {
      setError('Email не указан');
      return;
    }

    if (!code || code.trim().length < 4) {
      setError('Введите код подтверждения');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.post('/auth/verify-code', {
        email,
        code: code.trim(),
        role,
      });

      if (response.success && response.data) {
        const data = response.data as any;
        dispatch(setToken(data.token));
        dispatch(setUser(data.user));
        await apiService.setToken(data.token);

        const executorProfile = data.user?.executorProfile || data.user?.executor_profile;
        const isExecutorWaitingForApproval =
          data.user?.role === 'executor' && executorProfile && !executorProfile.is_verified;

        if (isExecutorWaitingForApproval) {
          navigation.reset({ index: 0, routes: [{ name: 'PendingExecutorApproval' }] });
        } else if (data.user?.role === 'executor') {
          navigation.reset({ index: 0, routes: [{ name: 'ExecutorTabs' }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'ClientTabs' }] });
        }
      }
    } catch (err: any) {
      if (err.code === 'USER_NOT_FOUND') {
        if (role === 'executor') {
          navigation.replace('ExecutorRegistration', { email });
          return;
        }

        navigation.replace('Registration', { email });
        return;
      }

      setError(err.message || 'Неверный или просроченный код');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      await apiService.post('/auth/request-code', { email, role });
    } catch (err: any) {
      setError(err.message || 'Не удалось отправить код повторно');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.custom.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.custom.text }]}>
          Подтверждение входа
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.custom.textSecondary }]}>
          Введите код, отправленный на {email}
        </Text>

        <CustomInput
          label="Код подтверждения"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          autoCapitalize="none"
          disabled={loading}
          style={styles.input}
        />

        {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handleVerify}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.button}
        >
          Подтвердить
        </CustomButton>

        <CustomButton
          mode="text"
          variant="secondary"
          onPress={handleResend}
          disabled={loading}
          fullWidth
        >
          Отправить код повторно
        </CustomButton>
      </View>
    </KeyboardAvoidingView>
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
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.md,
  },
  error: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  button: {
    marginBottom: spacing.sm,
  },
});