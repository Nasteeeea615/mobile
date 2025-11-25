import { Alert, Platform, ToastAndroid } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Показывает toast уведомление
 * На Android использует ToastAndroid, на iOS - Alert
 */
export const showToast = (message: string, type: ToastType = 'info', duration: 'short' | 'long' = 'short') => {
  if (Platform.OS === 'android') {
    const toastDuration = duration === 'short' ? ToastAndroid.SHORT : ToastAndroid.LONG;
    ToastAndroid.show(message, toastDuration);
  } else {
    // На iOS используем Alert
    const title = getToastTitle(type);
    Alert.alert(title, message);
  }
};

/**
 * Показывает toast успеха
 */
export const showSuccessToast = (message: string, duration: 'short' | 'long' = 'short') => {
  showToast(message, 'success', duration);
};

/**
 * Показывает toast ошибки
 */
export const showErrorToast = (message: string, duration: 'short' | 'long' = 'long') => {
  showToast(message, 'error', duration);
};

/**
 * Показывает toast предупреждения
 */
export const showWarningToast = (message: string, duration: 'short' | 'long' = 'short') => {
  showToast(message, 'warning', duration);
};

/**
 * Показывает toast информации
 */
export const showInfoToast = (message: string, duration: 'short' | 'long' = 'short') => {
  showToast(message, 'info', duration);
};

/**
 * Получает заголовок для toast в зависимости от типа
 */
const getToastTitle = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '✅ Успешно';
    case 'error':
      return '❌ Ошибка';
    case 'warning':
      return '⚠️ Внимание';
    case 'info':
      return 'ℹ️ Информация';
    default:
      return 'Уведомление';
  }
};

/**
 * Показывает подтверждающий диалог
 */
export const showConfirmDialog = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = 'Подтвердить',
  cancelText: string = 'Отмена'
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: confirmText,
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
};
