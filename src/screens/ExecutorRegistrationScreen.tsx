import React, { useState } from 'react';
import { View, StyleSheet, Keyboard, TouchableOpacity, Linking } from 'react-native';
import { Text, Checkbox, Card, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import apiService from '../services/api';
import { setUser, setToken } from '../store/slices/authSlice';
import DocumentUploadField from '../components/DocumentUploadField';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import KeyboardDismissWrapper from '../components/KeyboardDismissWrapper';
import { AppTheme, spacing } from '../theme';

export default function ExecutorRegistrationScreen() {
  const [name, setName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState<3 | 5 | 10 | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Document upload states
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);
  const [driverLicensePhoto, setDriverLicensePhoto] = useState<string | null>(null);
  const [vehicleRegistrationPhoto, setVehicleRegistrationPhoto] = useState<string | null>(null);
  const [documentErrors, setDocumentErrors] = useState({
    passport: '',
    driverLicense: '',
    vehicleRegistration: '',
  });

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const theme = useTheme<AppTheme>();

  const phoneNumber = route.params?.phoneNumber || '';

  const handleRegister = async () => {
    // Dismiss keyboard before validation
    Keyboard.dismiss();
    
    setError('');
    setDocumentErrors({
      passport: '',
      driverLicense: '',
      vehicleRegistration: '',
    });

    // Validation
    if (!name || !vehicleNumber || !vehicleCapacity) {
      setError('Заполните все поля');
      return;
    }

    // Document validation
    let hasDocumentErrors = false;
    const newDocumentErrors = {
      passport: '',
      driverLicense: '',
      vehicleRegistration: '',
    };

    if (!passportPhoto) {
      newDocumentErrors.passport = 'Необходимо загрузить фото паспорта';
      hasDocumentErrors = true;
    }

    if (!driverLicensePhoto) {
      newDocumentErrors.driverLicense = 'Необходимо загрузить фото водительского удостоверения';
      hasDocumentErrors = true;
    }

    if (!vehicleRegistrationPhoto) {
      newDocumentErrors.vehicleRegistration = 'Необходимо загрузить фото свидетельства о регистрации ТС';
      hasDocumentErrors = true;
    }

    if (hasDocumentErrors) {
      setDocumentErrors(newDocumentErrors);
      setError('Необходимо загрузить все документы');
      return;
    }

    if (!agreedToTerms) {
      setError('Необходимо согласиться с условиями');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.post('/auth/register-executor', {
        phone_number: phoneNumber,
        name,
        vehicle_number: vehicleNumber,
        vehicle_capacity: vehicleCapacity,
        agreed_to_terms: agreedToTerms,
        documents: {
          passport_photo: passportPhoto,
          driver_license_photo: driverLicensePhoto,
          vehicle_registration_photo: vehicleRegistrationPhoto,
        },
      });

      if (response.success && response.data) {
        const data = response.data as any;
        dispatch(setToken(data.token));
        dispatch(setUser(data.user));
        apiService.setToken(data.token);

        navigation.replace('ExecutorTabs');
      }
    } catch (err: any) {
      // Handle document upload errors specifically
      if (err.code === 'DOCUMENT_UPLOAD_ERROR') {
        setError('Не удалось загрузить документы. Попробуйте снова');
      } else {
        setError(err.message || 'Ошибка регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <KeyboardDismissWrapper contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.custom.text }]}>
          Регистрация исполнителя
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.custom.textSecondary }]}>
          Заполните данные для работы в качестве исполнителя
        </Text>

        <CustomInput
          label="Имя"
          value={name}
          onChangeText={setName}
          disabled={loading}
          style={styles.input}
        />

        <CustomInput
          label="Номер машины"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          placeholder="А123БВ77"
          disabled={loading}
          style={styles.input}
        />

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
          Объем машины
        </Text>

        <View style={styles.capacityContainer}>
          <TouchableOpacity
            style={[
              styles.capacityCard,
              { 
                backgroundColor: theme.custom.surface,
                borderColor: vehicleCapacity === 3 ? theme.custom.primary : theme.custom.border,
                borderWidth: vehicleCapacity === 3 ? 2 : 1,
              },
            ]}
            onPress={() => setVehicleCapacity(3)}
          >
            <Text variant="headlineMedium" style={[styles.capacityText, { color: theme.custom.text }]}>
              3 м³
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.capacityCard,
              { 
                backgroundColor: theme.custom.surface,
                borderColor: vehicleCapacity === 5 ? theme.custom.primary : theme.custom.border,
                borderWidth: vehicleCapacity === 5 ? 2 : 1,
              },
            ]}
            onPress={() => setVehicleCapacity(5)}
          >
            <Text variant="headlineMedium" style={[styles.capacityText, { color: theme.custom.text }]}>
              5 м³
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.capacityCard,
              { 
                backgroundColor: theme.custom.surface,
                borderColor: vehicleCapacity === 10 ? theme.custom.primary : theme.custom.border,
                borderWidth: vehicleCapacity === 10 ? 2 : 1,
              },
            ]}
            onPress={() => setVehicleCapacity(10)}
          >
            <Text variant="headlineMedium" style={[styles.capacityText, { color: theme.custom.text }]}>
              10 м³
            </Text>
          </TouchableOpacity>
        </View>

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
          Документы
        </Text>
        <Text variant="bodySmall" style={[styles.sectionSubtitle, { color: theme.custom.textSecondary }]}>
          Загрузите фотографии документов для верификации
        </Text>

        <DocumentUploadField
          label="Фото паспорта"
          value={passportPhoto}
          onUpload={(uri) => {
            setPassportPhoto(uri);
            setDocumentErrors({ ...documentErrors, passport: '' });
          }}
          onRemove={() => setPassportPhoto(null)}
          required
          error={!!documentErrors.passport}
          errorText={documentErrors.passport}
        />

        <DocumentUploadField
          label="Фото водительского удостоверения"
          value={driverLicensePhoto}
          onUpload={(uri) => {
            setDriverLicensePhoto(uri);
            setDocumentErrors({ ...documentErrors, driverLicense: '' });
          }}
          onRemove={() => setDriverLicensePhoto(null)}
          required
          error={!!documentErrors.driverLicense}
          errorText={documentErrors.driverLicense}
        />

        <DocumentUploadField
          label="Фото свидетельства о регистрации ТС"
          value={vehicleRegistrationPhoto}
          onUpload={(uri) => {
            setVehicleRegistrationPhoto(uri);
            setDocumentErrors({ ...documentErrors, vehicleRegistration: '' });
          }}
          onRemove={() => setVehicleRegistrationPhoto(null)}
          required
          error={!!documentErrors.vehicleRegistration}
          errorText={documentErrors.vehicleRegistration}
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

        {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

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

        <Text variant="bodySmall" style={[styles.note, { color: theme.custom.textSecondary }]}>
          Ваш аккаунт будет проверен администратором перед активацией
        </Text>
      </KeyboardDismissWrapper>
    </View>
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
  sectionTitle: {
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  sectionSubtitle: {
    marginBottom: spacing.md,
  },
  capacityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  capacityCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  capacityText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
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
  note: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
