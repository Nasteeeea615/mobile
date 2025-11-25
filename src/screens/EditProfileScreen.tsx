import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, Alert } from 'react-native';
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

export default function EditProfileScreen() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
  }>({});

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.clientProfile) {
        setCity(user.clientProfile.city || '');
        setStreet(user.clientProfile.street || '');
        setHouseNumber(user.clientProfile.houseNumber || user.clientProfile.house_number || '');
      }
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Введите имя';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    if (!city.trim()) {
      newErrors.city = 'Введите город';
    } else if (city.trim().length < 2) {
      newErrors.city = 'Название города должно содержать минимум 2 символа';
    }

    if (!street.trim()) {
      newErrors.street = 'Введите улицу';
    } else if (street.trim().length < 2) {
      newErrors.street = 'Название улицы должно содержать минимум 2 символа';
    }

    if (!houseNumber.trim()) {
      newErrors.houseNumber = 'Введите номер дома';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Dismiss keyboard before validation
    Keyboard.dismiss();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.put('/profile', {
        name: name.trim(),
        city: city.trim(),
        street: street.trim(),
        house_number: houseNumber.trim(),
      });

      if (response.success && response.data) {
        const data = response.data as any;
        dispatch(setUser(data.user));
        Alert.alert('Успешно', 'Профиль обновлен', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err: any) {
      Alert.alert('Ошибка', err.message || 'Ошибка обновления профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardDismissWrapper
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text 
        variant="headlineSmall" 
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        Редактирование профиля
      </Text>

        <CustomCard style={styles.formCard}>
          <CustomInput
            label="Имя"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            error={!!errors.name}
            errorText={errors.name}
            disabled={loading}
            autoCapitalize="words"
          />

          <CustomInput
            label="Город"
            value={city}
            onChangeText={(text) => {
              setCity(text);
              if (errors.city) {
                setErrors({ ...errors, city: undefined });
              }
            }}
            error={!!errors.city}
            errorText={errors.city}
            disabled={loading}
            autoCapitalize="words"
          />

          <CustomInput
            label="Улица"
            value={street}
            onChangeText={(text) => {
              setStreet(text);
              if (errors.street) {
                setErrors({ ...errors, street: undefined });
              }
            }}
            error={!!errors.street}
            errorText={errors.street}
            disabled={loading}
            autoCapitalize="words"
          />

          <CustomInput
            label="Номер дома"
            value={houseNumber}
            onChangeText={(text) => {
              setHouseNumber(text);
              if (errors.houseNumber) {
                setErrors({ ...errors, houseNumber: undefined });
              }
            }}
            error={!!errors.houseNumber}
            errorText={errors.houseNumber}
            disabled={loading}
          />
        </CustomCard>

        <View style={styles.buttonContainer}>
          <CustomButton
            mode="contained"
            variant="primary"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.button}
            fullWidth
          >
            Сохранить
          </CustomButton>

          <CustomButton
            mode="outlined"
            variant="secondary"
            onPress={handleCancel}
            disabled={loading}
            style={styles.button}
            fullWidth
          >
            Отмена
          </CustomButton>
        </View>
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
  title: {
    fontWeight: '700',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  formCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  buttonContainer: {
    gap: spacing.sm,
  },
  button: {
    marginBottom: spacing.sm,
  },
});
