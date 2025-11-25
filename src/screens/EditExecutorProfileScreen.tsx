import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import KeyboardDismissWrapper from '../components/KeyboardDismissWrapper';
import apiService from '../services/api';
import { spacing } from '../theme/theme';

export default function EditExecutorProfileScreen() {
  const [name, setName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [vehicleNumberError, setVehicleNumberError] = useState('');

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      const executorProfile = user.executorProfile || user.executor_profile;
      if (executorProfile) {
        setVehicleNumber(executorProfile.vehicleNumber || executorProfile.vehicle_number || '');
      }
    }
  }, [user]);

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('Имя обязательно');
      return false;
    }
    if (value.trim().length < 2) {
      setNameError('Имя должно содержать минимум 2 символа');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateVehicleNumber = (value: string) => {
    if (!value.trim()) {
      setVehicleNumberError('Номер машины обязателен');
      return false;
    }
    // Basic validation for vehicle number format
    const vehicleNumberRegex = /^[А-ЯA-Z0-9]{5,10}$/i;
    if (!vehicleNumberRegex.test(value.replace(/\s/g, ''))) {
      setVehicleNumberError('Неверный формат номера машины');
      return false;
    }
    setVehicleNumberError('');
    return true;
  };

  const handleSave = async () => {
    // Dismiss keyboard before validation
    Keyboard.dismiss();
    
    setError('');

    // Validate all fields
    const isNameValid = validateName(name);
    const isVehicleNumberValid = validateVehicleNumber(vehicleNumber);

    if (!isNameValid || !isVehicleNumberValid) {
      setError('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.put('/profile', {
        name: name.trim(),
        vehicle_number: vehicleNumber.trim(),
      });

      if (response.success && response.data) {
        const data = response.data as any;
        dispatch(setUser(data.user));
        navigation.goBack();
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка обновления профиля');
    } finally {
      setLoading(false);
    }
  };

  const executorProfile = user?.executorProfile || user?.executor_profile;

  return (
    <KeyboardDismissWrapper
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <CustomCard style={styles.formCard}>
        <Text 
          variant="titleLarge" 
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Редактирование профиля
        </Text>

          <CustomInput
            label="Имя"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (nameError) validateName(text);
            }}
            error={!!nameError}
            errorText={nameError}
            disabled={loading}
            autoCapitalize="words"
          />

          <CustomInput
            label="Номер машины"
            value={vehicleNumber}
            onChangeText={(text) => {
              setVehicleNumber(text);
              if (vehicleNumberError) validateVehicleNumber(text);
            }}
            placeholder="А123БВ77"
            error={!!vehicleNumberError}
            errorText={vehicleNumberError}
            disabled={loading}
            autoCapitalize="characters"
          />

          {executorProfile && (
            <View style={styles.infoSection}>
              <Text 
                variant="bodySmall" 
                style={[styles.infoLabel, { color: (theme as any).custom.textSecondary }]}
              >
                Объем машины
              </Text>
              <Text 
                variant="bodyLarge" 
                style={[styles.infoValue, { color: theme.colors.onSurface }]}
              >
                {executorProfile.vehicleCapacity || executorProfile.vehicle_capacity} м³
              </Text>
              <Text 
                variant="bodySmall" 
                style={[styles.note, { color: (theme as any).custom.textSecondary }]}
              >
                Примечание: Объем машины нельзя изменить после регистрации
              </Text>
            </View>
          )}

          {error ? (
            <Text style={[styles.error, { color: (theme as any).custom.black }]}>
              {error}
            </Text>
          ) : null}

          <CustomButton
            mode="contained"
            variant="primary"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
          >
            Сохранить изменения
          </CustomButton>

          <CustomButton
            mode="outlined"
            variant="secondary"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.cancelButton}
          >
            Отмена
          </CustomButton>
        </CustomCard>
    </KeyboardDismissWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  formCard: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontWeight: '700',
  },
  infoSection: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  infoLabel: {
    marginBottom: spacing.xs,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  note: {
    fontStyle: 'italic',
    fontSize: 12,
  },
  error: {
    marginBottom: spacing.md,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  saveButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    marginBottom: spacing.sm,
  },
});
