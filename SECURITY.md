# Безопасность Mobile App

Документация по настройкам безопасности мобильного приложения.

## Обзор

Реализованные меры безопасности:
- ✅ Secure Storage для токенов (Keychain/Keystore)
- ✅ HTTPS для всех API запросов
- ✅ Certificate pinning (рекомендуется)
- ✅ Защита от reverse engineering
- ✅ Безопасное хранение чувствительных данных
- ✅ Input validation
- ✅ Secure communication

## Secure Storage

Использует нативные механизмы безопасного хранения:
- **iOS**: Keychain
- **Android**: Keystore
- **Web**: localStorage (fallback, менее безопасно)

### Что хранится в Secure Storage:

- Auth token (JWT)
- Refresh token
- User ID
- Другие чувствительные данные

### Использование:

```typescript
import {
  saveAuthToken,
  getAuthToken,
  deleteAuthToken,
  saveSession,
  getSession,
  clearSession,
} from './utils/secureStorage';

// Сохранить токен
await saveAuthToken(token);

// Получить токен
const token = await getAuthToken();

// Удалить токен
await deleteAuthToken();

// Сохранить всю сессию
await saveSession(token, refreshToken, userId);

// Получить сессию
const { token, refreshToken, userId } = await getSession();

// Очистить сессию (logout)
await clearSession();
```

### Настройки безопасности:

**iOS Keychain:**
- `keychainAccessible: WHEN_UNLOCKED` - доступ только когда устройство разблокировано
- Данные защищены аппаратным шифрованием
- Автоматическое удаление при удалении приложения

**Android Keystore:**
- Аппаратное шифрование (если поддерживается)
- Защита от извлечения ключей
- Биометрическая защита (опционально)

### ❌ НЕ используйте AsyncStorage для токенов:

```typescript
// ❌ НЕБЕЗОПАСНО - AsyncStorage не шифрует данные
await AsyncStorage.setItem('token', token);

// ✅ БЕЗОПАСНО - SecureStore использует Keychain/Keystore
await saveAuthToken(token);
```

## HTTPS Communication

Все API запросы используют HTTPS.

### Настройка:

```typescript
// API URL всегда должен быть HTTPS в production
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.example.com'
  : 'http://localhost:3000';
```

### Проверка в коде:

```typescript
// В API сервисе
if (process.env.NODE_ENV === 'production' && !API_URL.startsWith('https://')) {
  throw new Error('API URL must use HTTPS in production');
}
```

## Certificate Pinning (Рекомендуется)

Защита от Man-in-the-Middle атак.

### Установка:

```bash
npm install react-native-ssl-pinning
```

### Настройка:

```typescript
import { fetch } from 'react-native-ssl-pinning';

// Получить SHA256 fingerprint вашего сертификата
const certificateFingerprint = 'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';

// Использовать pinned fetch
const response = await fetch('https://api.example.com/data', {
  method: 'GET',
  sslPinning: {
    certs: [certificateFingerprint],
  },
});
```

### Получение fingerprint:

```bash
# Для вашего домена
openssl s_client -connect api.example.com:443 < /dev/null | openssl x509 -fingerprint -sha256 -noout
```

## Защита от Reverse Engineering

### Обфускация кода:

**Для Android:**
```gradle
// android/app/build.gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

**Для iOS:**
- Используйте Xcode Build Settings
- Strip Debug Symbols: Yes
- Make Strings Read-Only: Yes

### Защита API ключей:

```typescript
// ❌ НЕБЕЗОПАСНО - ключи в коде
const API_KEY = 'my-secret-api-key';

// ✅ ЛУЧШЕ - используйте env переменные
const API_KEY = process.env.API_KEY;

// ✅ ЕЩЕ ЛУЧШЕ - получайте ключи с backend
const apiKey = await fetchApiKey();
```

### React Native Config:

```bash
npm install react-native-config
```

```env
# .env
API_URL=https://api.example.com
API_KEY=your_api_key_here
```

```typescript
import Config from 'react-native-config';

const API_URL = Config.API_URL;
const API_KEY = Config.API_KEY;
```

## Input Validation

Всегда валидируйте пользовательский ввод.

### Использование Yup:

```typescript
import * as yup from 'yup';
import { useValidatedForm } from './hooks/useValidatedForm';

const schema = yup.object({
  email: yup.string().email('Неверный email').required('Email обязателен'),
  phone: yup.string().matches(/^\+?[0-9]{10,15}$/, 'Неверный номер телефона'),
});

const form = useValidatedForm(schema);
```

### Sanitization:

```typescript
// Очистка HTML
const sanitizeHtml = (input: string) => {
  return input.replace(/<[^>]*>/g, '');
};

// Очистка SQL
const sanitizeSql = (input: string) => {
  return input.replace(/['";\\]/g, '');
};

// Использование
const cleanInput = sanitizeHtml(userInput);
```

## Безопасное хранение данных

### Что НЕ хранить в приложении:

- ❌ Пароли в открытом виде
- ❌ Полные номера кредитных карт
- ❌ API ключи (если возможно)
- ❌ Персональные данные без шифрования

### Что можно хранить:

- ✅ Токены в Secure Storage
- ✅ User ID
- ✅ Настройки приложения
- ✅ Кэш данных (не чувствительных)

### Очистка данных при logout:

```typescript
const logout = async () => {
  // Очистить secure storage
  await clearSession();
  
  // Очистить AsyncStorage
  await AsyncStorage.clear();
  
  // Очистить Redux store
  dispatch(resetStore());
  
  // Очистить кэш
  await clearCache();
};
```

## Биометрическая аутентификация

### Установка:

```bash
npm install expo-local-authentication
```

### Использование:

```typescript
import * as LocalAuthentication from 'expo-local-authentication';

// Проверка поддержки
const hasHardware = await LocalAuthentication.hasHardwareAsync();
const isEnrolled = await LocalAuthentication.isEnrolledAsync();

// Аутентификация
const result = await LocalAuthentication.authenticateAsync({
  promptMessage: 'Подтвердите вход',
  fallbackLabel: 'Использовать пароль',
  disableDeviceFallback: false,
});

if (result.success) {
  // Успешная аутентификация
  const token = await getAuthToken();
  // Продолжить работу
}
```

### Настройка:

```typescript
// Сохранить настройку биометрии
await AsyncStorage.setItem('biometricEnabled', 'true');

// При входе проверять настройку
const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
if (biometricEnabled === 'true') {
  await authenticateWithBiometric();
}
```

## Защита экрана

### Скрытие контента при переключении приложений:

```typescript
import { AppState } from 'react-native';

// Слушать изменения состояния
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'background') {
    // Скрыть чувствительный контент
    setShowSensitiveData(false);
  }
});
```

### Запрет скриншотов (Android):

```java
// android/app/src/main/java/com/yourapp/MainActivity.java
import android.view.WindowManager;

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Запретить скриншоты
    getWindow().setFlags(
        WindowManager.LayoutParams.FLAG_SECURE,
        WindowManager.LayoutParams.FLAG_SECURE
    );
}
```

## Session Management

### Автоматический logout при неактивности:

```typescript
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 минут

const useInactivityLogout = () => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      // Автоматический logout
      logout();
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    resetTimer();
    
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        resetTimer();
      }
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      subscription.remove();
    };
  }, []);
};
```

### Refresh token rotation:

```typescript
// Автоматическое обновление токена
const refreshAuthToken = async () => {
  const refreshToken = await getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await apiService.post('/auth/refresh', {
    refreshToken,
  });

  await saveAuthToken(response.data.token);
  await saveRefreshToken(response.data.refreshToken);
};

// Проверка и обновление токена
const ensureValidToken = async () => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('No token');
  }

  // Проверить срок действия
  const decoded = jwtDecode(token);
  const expiresIn = decoded.exp * 1000 - Date.now();

  // Обновить если осталось меньше 5 минут
  if (expiresIn < 5 * 60 * 1000) {
    await refreshAuthToken();
  }
};
```

## Deep Links Security

### Валидация deep links:

```typescript
import * as Linking from 'expo-linking';

// Обработка deep link
Linking.addEventListener('url', (event) => {
  const url = event.url;
  
  // Валидация URL
  if (!isValidDeepLink(url)) {
    console.warn('Invalid deep link:', url);
    return;
  }

  // Обработка
  handleDeepLink(url);
});

const isValidDeepLink = (url: string): boolean => {
  // Проверить схему
  if (!url.startsWith('myapp://')) {
    return false;
  }

  // Проверить домен (для universal links)
  const allowedDomains = ['example.com', 'app.example.com'];
  const domain = new URL(url).hostname;
  
  return allowedDomains.includes(domain);
};
```

## Best Practices

### 1. Всегда используйте Secure Storage для токенов

```typescript
// ❌ Плохо
await AsyncStorage.setItem('token', token);

// ✅ Хорошо
await saveAuthToken(token);
```

### 2. Проверяйте SSL сертификаты

```typescript
// ✅ Certificate pinning в production
if (process.env.NODE_ENV === 'production') {
  enableCertificatePinning();
}
```

### 3. Валидируйте все входные данные

```typescript
// ✅ Всегда валидируйте
const form = useValidatedForm(schema);
```

### 4. Не храните чувствительные данные в коде

```typescript
// ❌ Плохо
const API_KEY = 'secret-key';

// ✅ Хорошо
const API_KEY = Config.API_KEY;
```

### 5. Очищайте данные при logout

```typescript
// ✅ Полная очистка
await clearSession();
await AsyncStorage.clear();
dispatch(resetStore());
```

### 6. Используйте HTTPS в production

```typescript
// ✅ Проверка
if (process.env.NODE_ENV === 'production' && !API_URL.startsWith('https://')) {
  throw new Error('Must use HTTPS');
}
```

### 7. Обновляйте зависимости

```bash
# Проверка уязвимостей
npm audit

# Обновление
npm update
```

## Security Checklist

- [ ] Secure Storage настроен для токенов
- [ ] HTTPS используется для всех API запросов
- [ ] Certificate pinning настроен (production)
- [ ] Input validation работает
- [ ] Биометрическая аутентификация доступна
- [ ] Автоматический logout при неактивности
- [ ] Refresh token rotation работает
- [ ] Deep links валидируются
- [ ] Скриншоты запрещены для чувствительных экранов
- [ ] Обфускация кода включена (production)
- [ ] API ключи в env переменных
- [ ] Зависимости обновлены (npm audit)
- [ ] .env файлы в .gitignore

## Тестирование безопасности

### Что тестировать:

1. **Token storage** - токены в Secure Storage
2. **HTTPS** - все запросы через HTTPS
3. **Input validation** - валидация работает
4. **Session timeout** - автоматический logout
5. **Biometric auth** - биометрия работает

### Инструменты:

- **Reactotron** - отладка Redux и API
- **Flipper** - отладка React Native
- **Charles Proxy** - анализ сетевого трафика
- **OWASP ZAP** - тестирование безопасности

## Дополнительные ресурсы

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)
- [iOS Security Guide](https://support.apple.com/guide/security/welcome/web)
- [Android Security](https://source.android.com/security)
