import React, { useState } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import VehicleSelector from '../components/VehicleSelector';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import KeyboardDismissWrapper from '../components/KeyboardDismissWrapper';
import apiService from '../services/api';
import { addOrder } from '../store/slices/orderSlice';
import { AppTheme, spacing } from '../theme';

export default function ClientHomeScreen() {
  // Form state
  const [vehicleCapacity, setVehicleCapacity] = useState<3 | 5 | 10 | null>(null);
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [comment, setComment] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  const dispatch = useDispatch();
  const theme = useTheme<AppTheme>();

  const calculatePrice = () => {
    if (!vehicleCapacity) return 0;
    return vehicleCapacity * 600;
  };

  // Форматирование даты: ДД.ММ.ГГГГ
  const handleDateInput = (text: string) => {
    // Удаляем все нецифровые символы
    const numbers = text.replace(/[^\d]/g, '');
    
    let formatted = '';
    
    // Форматируем по мере ввода
    if (numbers.length > 0) {
      formatted = numbers.substring(0, 2); // ДД
    }
    if (numbers.length >= 3) {
      formatted += '.' + numbers.substring(2, 4); // .ММ
    }
    if (numbers.length >= 5) {
      formatted += '.' + numbers.substring(4, 8); // .ГГГГ
    }
    
    setDateInput(formatted);
  };

  // Форматирование времени: ЧЧ:ММ
  const handleTimeInput = (text: string) => {
    // Удаляем все нецифровые символы
    const numbers = text.replace(/[^\d]/g, '');
    
    let formatted = '';
    
    // Форматируем по мере ввода
    if (numbers.length > 0) {
      formatted = numbers.substring(0, 2); // ЧЧ
    }
    if (numbers.length >= 3) {
      formatted += ':' + numbers.substring(2, 4); // :ММ
    }
    
    setTimeInput(formatted);
  };

  // Валидация даты
  const isValidDate = (dateStr: string): boolean => {
    if (dateStr.length !== 10) return false;
    
    const parts = dateStr.split('.');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 2024 || year > 2100) return false;
    
    return true;
  };

  // Валидация времени
  const isValidTime = (timeStr: string): boolean => {
    if (timeStr.length !== 5) return false;
    
    const parts = timeStr.split(':');
    if (parts.length !== 2) return false;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;
    
    return true;
  };

  const handleUrgentOrder = () => {
    setIsUrgent(true);
    // Устанавливаем текущую дату и время
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    setDateInput(`${day}.${month}.${year}`);
    setTimeInput(`${hours}:${minutes}`);
    handleOrderPress();
  };

  const handleOrderPress = () => {
    // Dismiss keyboard before validation
    Keyboard.dismiss();
    
    setError('');

    // Validation
    if (!vehicleCapacity) {
      setError('Выберите объем машины');
      return;
    }

    if (!city || !street || !houseNumber) {
      setError('Заполните адрес');
      return;
    }

    if (!dateInput || !isValidDate(dateInput)) {
      setError('Введите корректную дату (ДД.ММ.ГГГГ)');
      return;
    }

    if (!timeInput || !isValidTime(timeInput)) {
      setError('Введите корректное время (ЧЧ:ММ)');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // Преобразуем дату в формат YYYY-MM-DD
      const dateParts = dateInput.split('.');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

      const response = await apiService.post('/orders', {
        vehicle_capacity: vehicleCapacity,
        city,
        street,
        house_number: houseNumber,
        scheduled_date: formattedDate,
        scheduled_time: timeInput,
        comment: comment || undefined,
        is_urgent: isUrgent,
      });

      if (response.success && response.data) {
        const data = response.data as any;
        dispatch(addOrder(data.order));

        // Reset form
        setVehicleCapacity(null);
        setCity('');
        setStreet('');
        setHouseNumber('');
        setDateInput('');
        setTimeInput('');
        setComment('');
        setIsUrgent(false);
        setShowConfirmModal(false);

        // Show success message or navigate
        alert('Заказ успешно создан!');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка создания заказа');
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <KeyboardDismissWrapper contentContainerStyle={styles.scrollContent}>
        <VehicleSelector selectedCapacity={vehicleCapacity} onSelect={setVehicleCapacity} />

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
          Адрес
        </Text>

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

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
          Дата и время
        </Text>

        <View style={styles.dateTimeContainer}>
          <CustomInput
            label="Дата"
            placeholder="ДД.ММ.ГГГГ"
            value={dateInput}
            onChangeText={handleDateInput}
            keyboardType="numeric"
            maxLength={10}
            disabled={loading}
            style={styles.dateTimeInput}
            returnKeyType="next"
            blurOnSubmit={false}
          />

          <CustomInput
            label="Время"
            placeholder="ЧЧ:ММ"
            value={timeInput}
            onChangeText={handleTimeInput}
            keyboardType="numeric"
            maxLength={5}
            disabled={loading}
            style={styles.dateTimeInput}
            returnKeyType="done"
            blurOnSubmit={true}
          />
        </View>

        <CustomInput
          label="Комментарий (необязательно)"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={3}
          disabled={loading}
          style={styles.input}
        />

        {error ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
        ) : null}

        <CustomButton
          mode="contained"
          variant="primary"
          onPress={handleOrderPress}
          disabled={loading || !vehicleCapacity}
          fullWidth
          style={styles.orderButton}
        >
          {`Заказать за ${calculatePrice()} ₽`}
        </CustomButton>

        <CustomButton
          mode="outlined"
          variant="secondary"
          onPress={handleUrgentOrder}
          disabled={loading || !vehicleCapacity}
          fullWidth
          style={styles.urgentButton}
        >
          Срочный заказ
        </CustomButton>

      </KeyboardDismissWrapper>
      
      <ConfirmationModal
        visible={showConfirmModal}
        title="Подтверждение заказа"
        message={`Заказать машину ${vehicleCapacity} м³ на ${dateInput} в ${timeInput}?\n\nСтоимость: ${calculatePrice()} ₽`}
        onConfirm={handleConfirmOrder}
        onCancel={() => setShowConfirmModal(false)}
        confirmText="Заказать"
        loading={loading}
      />
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
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  dateTimeInput: {
    flex: 1,
  },
  error: {
    marginBottom: spacing.md,
    fontSize: 12,
  },
  orderButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  urgentButton: {
    marginBottom: spacing.lg,
  },
});
