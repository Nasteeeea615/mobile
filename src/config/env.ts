import { Platform } from 'react-native';

/**
 * Environment configuration
 * 
 * Автоматически определяет правильный URL в зависимости от платформы
 * В мок-режиме URL не используется
 */

const isDevelopment = __DEV__;

/**
 * Получить URL для разработки в зависимости от платформы
 */
function getDevelopmentApiUrl(): string {
  // Для эмуляторов и симуляторов
  if (Platform.OS === 'android') {
    // Android эмулятор: 10.0.2.2 указывает на localhost хост-машины
    return 'http://10.0.2.2:3000/api';
  } else if (Platform.OS === 'ios') {
    // iOS симулятор: localhost работает напрямую
    return 'http://localhost:3000/api';
  } else {
    // Web или другие платформы
    return 'http://localhost:3000/api';
  }
}

function getDevelopmentWsUrl(): string {
  if (Platform.OS === 'android') {
    return 'ws://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    return 'ws://localhost:3000';
  } else {
    return 'ws://localhost:3000';
  }
}

export const ENV = {
  API_URL: isDevelopment 
    ? getDevelopmentApiUrl()
    : 'https://api.example.com/api',
  
  WS_URL: isDevelopment 
    ? getDevelopmentWsUrl()
    : 'wss://api.example.com',
};

// Логируем текущую конфигурацию в dev режиме
if (isDevelopment) {
  console.log('[ENV] Configuration:', {
    platform: Platform.OS,
    apiUrl: ENV.API_URL,
  });
}
