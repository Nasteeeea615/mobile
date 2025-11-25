import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { AppTheme, spacing } from '../theme';

export default function PhoneInputScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();
  const theme = useTheme<AppTheme>();

  const handleSendCode = async () => {
    setError('');

    // Basic validation
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.post('/auth/send-sms', {
        phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+7${phoneNumber}`,
      });

      if (response.success) {
        navigation.navigate('SMSVerification', {
          phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+7${phoneNumber}`,
        });
      }
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
          Вход в приложение
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.custom.textSecondary }]}>
          Введите номер телефона для получения кода подтверждения
        </Text>

        <CustomInput
          label="Номер телефона"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder="+7 (999) 123-45-67"
          error={!!error}
          errorText={error}
          disabled={loading}
          style={styles.input}
        />

        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handleSendCode}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.button}
        >
          Получить код
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
});
