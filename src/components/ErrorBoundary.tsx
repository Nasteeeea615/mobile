import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { spacing } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - компонент для перехвата и обработки ошибок React
 * Предотвращает крах всего приложения при возникновении ошибки
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Логирование ошибки
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Здесь можно отправить ошибку в сервис мониторинга (например, Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Если передан кастомный fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Иначе показываем стандартный экран ошибки
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text variant="headlineMedium" style={styles.title}>
              😔 Что-то пошло не так
            </Text>
            <Text variant="bodyLarge" style={styles.message}>
              Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text variant="titleSmall" style={styles.errorTitle}>
                  Детали ошибки (только в режиме разработки):
                </Text>
                <Text variant="bodySmall" style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text variant="bodySmall" style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <Button
              mode="contained"
              onPress={this.handleReset}
              style={styles.button}
            >
              Попробовать снова
            </Button>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  message: {
    marginBottom: spacing.xl,
    textAlign: 'center',
    color: '#666',
  },
  errorDetails: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: spacing.sm,
    fontFamily: 'monospace',
  },
  errorStack: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  button: {
    minWidth: 200,
  },
});

export default ErrorBoundary;
