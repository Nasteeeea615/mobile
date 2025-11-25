import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';

type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType, duration?: number) => void;
  hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

interface SnackbarProviderProps {
  children: ReactNode;
}

/**
 * SnackbarProvider - провайдер для управления snackbar уведомлениями
 * Использует React Native Paper Snackbar для красивых уведомлений
 */
export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('info');
  const [duration, setDuration] = useState(3000);

  const showSnackbar = useCallback(
    (msg: string, snackbarType: SnackbarType = 'info', snackbarDuration: number = 3000) => {
      setMessage(msg);
      setType(snackbarType);
      setDuration(snackbarDuration);
      setVisible(true);
    },
    []
  );

  const hideSnackbar = useCallback(() => {
    setVisible(false);
  }, []);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      default:
        return '#323232';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '';
    }
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={duration}
        action={{
          label: 'Закрыть',
          onPress: hideSnackbar,
        }}
        style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}
      >
        {getIcon()} {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

/**
 * Hook для использования snackbar
 */
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return context;
};

/**
 * Хелперы для быстрого вызова snackbar
 */
export const useSnackbarHelpers = () => {
  const { showSnackbar } = useSnackbar();

  return {
    showSuccess: (message: string, duration?: number) =>
      showSnackbar(message, 'success', duration),
    showError: (message: string, duration?: number) =>
      showSnackbar(message, 'error', duration),
    showWarning: (message: string, duration?: number) =>
      showSnackbar(message, 'warning', duration),
    showInfo: (message: string, duration?: number) =>
      showSnackbar(message, 'info', duration),
  };
};

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 20,
  },
});
