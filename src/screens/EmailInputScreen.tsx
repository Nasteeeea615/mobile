import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { AppTheme, spacing } from '../theme';

export default function EmailInputScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();
  const theme = useTheme<AppTheme>();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setError('');

    // Basic validation
    if (!email || !validateEmail(email)) {
      setError('Введите корректный email');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.post('/auth/request-code', { email });

      if (response.success && response.data) {
        navigation.navigate('VerificationCode', { email });
      }
    } catch (err: any) {
      if (err.code === 'USER_NOT_FOUND') {
        // User doesn't exist - navigate to registration
        navigation.navigate('Registration', { email });
      } else {
        setError(err.message || 'Ошибка входа');
      }
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
        <Text variant="headlineLarge" style={[styles.title, { color: theme.custom.text }]}>
          Добро пожаловать
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.custom.textSecondary }]}>
            Войдите по коду подтверждения из email
        </Text>

        <CustomInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="example@mail.com"
          error={!!error && error.includes('email')}
          disabled={loading}
          style={styles.input}
        />

        {error && <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>}

        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.button}
        >
          Получить код
        </CustomButton>

        <CustomButton
          mode="text"
          variant="secondary"
          onPress={() => navigation.navigate('Registration', { email })}
          disabled={loading}
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
    marginBottom: spacing.xl,
    textAlign: 'center',
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
