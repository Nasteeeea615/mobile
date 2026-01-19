import React, { useState } from 'react';
import { View, StyleSheet, Keyboard, Linking } from 'react-native';
import { Text, Checkbox, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import apiService from '../services/api';
import { setUser, setToken } from '../store/slices/authSlice';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import KeyboardDismissWrapper from '../components/KeyboardDismissWrapper';
import { AppTheme, spacing } from '../theme';

export default function RegistrationScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const theme = useTheme<AppTheme>();

  const prefillEmail = route.params?.email || '';

  React.useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // Dismiss keyboard before validation
    Keyboard.dismiss();
    
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};

    if (!email || !validateEmail(email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (!name) {
      newErrors.name = 'Введите имя';
    }

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Введите номер телефона';
    }

    if (!city) {
      newErrors.city = 'Введите город';
    }

    if (!street) {
      newErrors.street = 'Введите улицу';
    }

    if (!houseNumber) {
      newErrors.houseNumber = 'Введите номер дома';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Необходимо согласиться с условиями';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.post('/auth/register-client', {
        email,
        password,
        name,
        phone_number: phoneNumber,
        city,
        street,
        house_number: houseNumber,
        agreed_to_terms: agreedToTerms,
      });

      if (response.success && response.data) {
        const data = response.data as any;
        dispatch(setToken(data.token));
        dispatch(setUser(data.user));
        apiService.setToken(data.token);

        navigation.replace('ClientTabs');
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'Ошибка регистрации' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardDismissWrapper
      style={[styles.container, { backgroundColor: theme.custom.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text variant="headlineMedium" style={[styles.title, { color: theme.custom.text }]}>
        Регистрация заказчика
      </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.custom.textSecondary }]}>
          Заполните данные для создания аккаунта
        </Text>

        <CustomInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={loading}
          error={!!errors.email}
          errorText={errors.email}
          style={styles.input}
        />

        <CustomInput
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          disabled={loading}
          error={!!errors.password}
          errorText={errors.password}
          style={styles.input}
        />

        <CustomInput
          label="Подтвердите пароль"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          disabled={loading}
          error={!!errors.confirmPassword}
          errorText={errors.confirmPassword}
          style={styles.input}
        />

        <CustomInput
          label="Имя"
          value={name}
          onChangeText={setName}
          disabled={loading}
          error={!!errors.name}
          errorText={errors.name}
          style={styles.input}
        />

        <CustomInput
          label="Номер телефона"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder="+7 (999) 123-45-67"
          disabled={loading}
          error={!!errors.phoneNumber}
          errorText={errors.phoneNumber}
          style={styles.input}
        />

        <CustomInput
          label="Город"
          value={city}
          onChangeText={setCity}
          disabled={loading}
          error={!!errors.city}
          errorText={errors.city}
          style={styles.input}
        />

        <CustomInput
          label="Улица"
          value={street}
          onChangeText={setStreet}
          disabled={loading}
          error={!!errors.street}
          errorText={errors.street}
          style={styles.input}
        />

        <CustomInput
          label="Номер дома"
          value={houseNumber}
          onChangeText={setHouseNumber}
          disabled={loading}
          error={!!errors.houseNumber}
          errorText={errors.houseNumber}
          style={styles.input}
        />

        <View style={[styles.checkboxContainer, { 
          backgroundColor: theme.custom.surface,
          borderColor: theme.custom.border,
          borderWidth: 1,
          borderRadius: 8,
          padding: spacing.md,
        }]}>
          <Checkbox
            status={agreedToTerms ? 'checked' : 'unchecked'}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            disabled={loading}
            color={theme.custom.primary}
          />
          <Text style={[styles.checkboxLabel, { color: theme.custom.text }]}>
            Я согласен с{' '}
            <Text 
              style={{ color: theme.custom.primary, textDecorationLine: 'underline' }}
              onPress={() => Linking.openURL('https://example.com/terms')}
            >
              пользовательским соглашением
            </Text>
          </Text>
        </View>

        {errors.general && (
          <Text style={[styles.error, { color: theme.colors.error }]}>{errors.general}</Text>
        )}

        {errors.terms && (
          <Text style={[styles.error, { color: theme.colors.error }]}>{errors.terms}</Text>
        )}

        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.button}
        >
          Зарегистрироваться
        </CustomButton>

        <CustomButton
          mode="outlined"
          variant="secondary"
          onPress={() => navigation.navigate('ExecutorRegistration', { email })}
          disabled={loading}
          fullWidth
          style={styles.switchButton}
        >
          Хочу стать исполнителем
        </CustomButton>
    </KeyboardDismissWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  error: {
    marginBottom: spacing.sm,
    fontSize: 12,
  },
  button: {
    marginTop: spacing.md,
  },
  switchButton: {
    marginTop: spacing.md,
  },
});
