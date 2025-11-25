import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Безопасное хранилище для чувствительных данных
 * Использует Keychain (iOS) и Keystore (Android)
 */

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ID_KEY = 'user_id';

/**
 * Проверка доступности SecureStore
 */
const isSecureStoreAvailable = async (): Promise<boolean> => {
  try {
    // SecureStore доступен только на нативных платформах
    if (Platform.OS === 'web') {
      return false;
    }
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

/**
 * Сохранить значение в безопасное хранилище
 */
export const secureSet = async (key: string, value: string): Promise<void> => {
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED, // Доступ только когда устройство разблокировано
      });
    } else {
      // Fallback для web - используем localStorage (менее безопасно)
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    }
  } catch (error) {
    console.error(`Failed to save ${key} to secure storage:`, error);
    throw error;
  }
};

/**
 * Получить значение из безопасного хранилища
 */
export const secureGet = async (key: string): Promise<string | null> => {
  try {
    if (await isSecureStoreAvailable()) {
      return await SecureStore.getItemAsync(key);
    } else {
      // Fallback для web
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    }
  } catch (error) {
    console.error(`Failed to get ${key} from secure storage:`, error);
    return null;
  }
};

/**
 * Удалить значение из безопасного хранилища
 */
export const secureDelete = async (key: string): Promise<void> => {
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(key);
    } else {
      // Fallback для web
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error(`Failed to delete ${key} from secure storage:`, error);
    throw error;
  }
};

/**
 * Очистить все данные из безопасного хранилища
 */
export const secureClear = async (): Promise<void> => {
  try {
    await secureDelete(TOKEN_KEY);
    await secureDelete(REFRESH_TOKEN_KEY);
    await secureDelete(USER_ID_KEY);
  } catch (error) {
    console.error('Failed to clear secure storage:', error);
    throw error;
  }
};

// Специфичные методы для токенов

/**
 * Сохранить токен авторизации
 */
export const saveAuthToken = async (token: string): Promise<void> => {
  await secureSet(TOKEN_KEY, token);
};

/**
 * Получить токен авторизации
 */
export const getAuthToken = async (): Promise<string | null> => {
  return await secureGet(TOKEN_KEY);
};

/**
 * Удалить токен авторизации
 */
export const deleteAuthToken = async (): Promise<void> => {
  await secureDelete(TOKEN_KEY);
};

/**
 * Сохранить refresh token
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  await secureSet(REFRESH_TOKEN_KEY, token);
};

/**
 * Получить refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  return await secureGet(REFRESH_TOKEN_KEY);
};

/**
 * Удалить refresh token
 */
export const deleteRefreshToken = async (): Promise<void> => {
  await secureDelete(REFRESH_TOKEN_KEY);
};

/**
 * Сохранить ID пользователя
 */
export const saveUserId = async (userId: string): Promise<void> => {
  await secureSet(USER_ID_KEY, userId);
};

/**
 * Получить ID пользователя
 */
export const getUserId = async (): Promise<string | null> => {
  return await secureGet(USER_ID_KEY);
};

/**
 * Удалить ID пользователя
 */
export const deleteUserId = async (): Promise<void> => {
  await secureDelete(USER_ID_KEY);
};

/**
 * Сохранить данные сессии (токен + refresh token + user ID)
 */
export const saveSession = async (
  token: string,
  refreshToken: string,
  userId: string
): Promise<void> => {
  await Promise.all([
    saveAuthToken(token),
    saveRefreshToken(refreshToken),
    saveUserId(userId),
  ]);
};

/**
 * Получить данные сессии
 */
export const getSession = async (): Promise<{
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
}> => {
  const [token, refreshToken, userId] = await Promise.all([
    getAuthToken(),
    getRefreshToken(),
    getUserId(),
  ]);

  return { token, refreshToken, userId };
};

/**
 * Очистить сессию (logout)
 */
export const clearSession = async (): Promise<void> => {
  await secureClear();
};

/**
 * Проверить наличие активной сессии
 */
export const hasActiveSession = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return token !== null;
};
