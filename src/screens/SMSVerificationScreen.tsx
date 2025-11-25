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

export default function SMSVerificationScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const theme = useTheme<AppTheme>();

  const phoneNumber = route.params?.phoneNumber || '';

  const handleVerifyCode = async () => {
    setError('');

    if (!code || code.length !== 4) {
      setError('Введите 4-значный код');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.post('/auth/verify-sms', {
        phoneNumber,
        code,
      });

      if (response.success && response.data) {
        const data = response.data as any;
        if (data.isNewUser) {
          // New user - navigate to registration
          navigation.navigate('Registration', { phoneNumber });
        } else {
          // Existing user - save token and navigate to app
          dispatch(setToken(data.token));
          dispatch(setUser(data.user));
          apiService.setToken(data.token);

          // Navigate based on user role
          if (data.user.role === 'client') {
            navigation.replace('ClientTabs');
          } else if (data.user.role === 'executor') {
            navigation.replace('ExecutorTabs');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Неверный код');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    try {
      await apiService.post('/auth/send-sms', { phoneNumber });
      setError('');
      // Show success message
    } catch (err: any) {
      setError(err.message || 'Ошибка отправки SMS');
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
          Подтверждение
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.custom.textSecondary }]}>
          Введите код из SMS, отправленного на номер {phoneNumber}
        </Text>

        <CustomInput
          label="Код из SMS"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          error={!!error}
          errorText={error}
          disabled={loading}
          style={styles.input}
        />

        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handleVerifyCode}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.button}
        >
          Подтвердить
        </CustomButton>

        <CustomButton
          mode="outlined"
          variant="secondary"
          onPress={handleResendCode}
          disabled={loading}
          fullWidth
          style={styles.resend}
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
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  input: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
  resend: {
    marginTop: spacing.md,
  },
});
