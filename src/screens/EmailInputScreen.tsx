import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import apiService from '../services/api';
import { setUser, setToken } from '../store/slices/authSlice';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { AppTheme, spacing } from '../theme';
import { useSnackbarHelpers } from '../components/SnackbarProvider';

export default function EmailInputScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'executor'>('client');
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const theme = useTheme<AppTheme>();
  const { showInfo } = useSnackbarHelpers();

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Send a would-be registrant to the right registration screen for their role.
  const goToRegistration = () => {
    if (role === 'executor') {
      navigation.navigate('ExecutorRegistration', { email });
    } else {
      navigation.navigate('Registration', { email });
    }
  };

  // Route the user to the right place once we have a token + user object.
  const enterApp = async (data: any) => {
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
  };

  // Primary: email + password.
  const handlePasswordLogin = async () => {
    setError('');
    if (!email || !validateEmail(email)) {
      setError('Введите корректный email');
      return;
    }
    if (!password) {
      setError('Введите пароль');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.post('/auth/login-password', {
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      if (response.success && response.data) {
        await enterApp(response.data);
      }
    } catch (err: any) {
      if (err.code === 'USER_NOT_FOUND' || err.code === 'NOT_REGISTERED') {
        goToRegistration();
      } else if (err.code === 'INVALID_CREDENTIALS') {
        setError('Неверный email или пароль. Можно войти по коду из почты.');
      } else {
        setError(err.message || 'Ошибка входа');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback: log in with a one-time code sent to email.
  const handleCodeLogin = async () => {
    setError('');
    if (!email || !validateEmail(email)) {
      setError('Введите корректный email');
      return;
    }

    setCodeLoading(true);
    try {
      const response = await apiService.post('/auth/request-code', { email, role });
      if (response.success && response.data) {
        const debugCode = __DEV__ ? (response.data as any)?.debugCode : undefined;
        if (__DEV__ && debugCode) {
          showInfo(`Dev code: ${debugCode}`, 7000);
        }
        navigation.navigate('VerificationCode', { email, role, debugCode });
      }
    } catch (err: any) {
      if (err.code === 'USER_NOT_FOUND') {
        goToRegistration();
      } else {
        setError(err.message || 'Не удалось отправить код');
      }
    } finally {
      setCodeLoading(false);
    }
  };

  const busy = loading || codeLoading;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.custom.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text variant="headlineLarge" style={[styles.title, { color: theme.custom.text }]}>
          Добро пожаловать
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.custom.textSecondary }]}>
          Выберите роль и войдите по email и паролю
        </Text>

        <View style={styles.roleRow}>
          <CustomButton
            mode={role === 'client' ? 'contained' : 'outlined'}
            variant="primary"
            onPress={() => setRole('client')}
            disabled={busy}
            icon="account"
            style={styles.roleBtn}
          >
            Заказчик
          </CustomButton>
          <CustomButton
            mode={role === 'executor' ? 'contained' : 'outlined'}
            variant="primary"
            onPress={() => setRole('executor')}
            disabled={busy}
            icon="truck"
            style={styles.roleBtn}
          >
            Исполнитель
          </CustomButton>
        </View>

        <CustomInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="example@mail.com"
          error={!!error && error.includes('email')}
          disabled={busy}
          style={styles.input}
        />

        <CustomInput
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          disabled={busy}
          style={styles.input}
        />

        {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handlePasswordLogin}
          loading={loading}
          disabled={busy}
          fullWidth
          style={styles.button}
        >
          Войти
        </CustomButton>

        <CustomButton
          mode="text"
          variant="secondary"
          onPress={handleCodeLogin}
          loading={codeLoading}
          disabled={busy}
          fullWidth
          style={styles.registerButton}
        >
          Войти по коду из email
        </CustomButton>

        <CustomButton
          mode="text"
          variant="secondary"
          onPress={goToRegistration}
          disabled={busy}
          fullWidth
          style={styles.registerButton}
        >
          Нет аккаунта? Зарегистрироваться
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
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roleBtn: {
    flex: 1,
  },
  input: {
    marginBottom: spacing.md,
  },
  error: {
    marginBottom: spacing.sm,
    fontSize: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
  },
  registerButton: {
    marginTop: spacing.sm,
  },
});
