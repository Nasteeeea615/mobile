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
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const theme = useTheme<AppTheme>();

  const phoneNumber = route.params?.phoneNumber || '';

  const handleRegister = async () => {
    // Dismiss keyboard before validation
    Keyboard.dismiss();
    
    setError('');

    // Validation
    if (!name || !city || !street || !houseNumber) {
      setError('Заполните все поля');
      return;
    }

    if (!agreedToTerms) {
      setError('Необходимо согласиться с условиями');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.post('/auth/register-client', {
        phone_number: phoneNumber,
        name,
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
      setError(err.message || 'Ошибка регистрации');
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
        Регистрация
      </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.custom.textSecondary }]}>
          Заполните данные для создания аккаунта
        </Text>

        <CustomInput
          label="Имя"
          value={name}
          onChangeText={setName}
          disabled={loading}
          style={styles.input}
        />

        <CustomInput
          label="Город"
          value={city}
          onChangeText={setCity}
          disabled={loading}
          style={styles.input}
        />

        <CustomInput
          label="Улица"
          value={street}
          onChangeText={setStreet}
          disabled={loading}
          style={styles.input}
        />

        <CustomInput
          label="Номер дома"
          value={houseNumber}
          onChangeText={setHouseNumber}
          disabled={loading}
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

        {error ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
        ) : null}

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
          onPress={() => navigation.navigate('ExecutorRegistration', { phoneNumber })}
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
