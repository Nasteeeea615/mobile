#!/usr/bin/env pwsh
# Push Notifications Setup Script для Windows
# Настройка Expo Notifications с Firebase

Write-Host "🔔 Push Notifications Setup Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$mobileDir = Join-Path $PSScriptRoot ".."

# Проверка установки expo-notifications
Write-Host "📦 Проверка зависимостей..." -ForegroundColor Yellow

Set-Location $mobileDir

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$hasNotifications = $packageJson.dependencies."expo-notifications"

if (-not $hasNotifications) {
    Write-Host "❌ expo-notifications не установлен" -ForegroundColor Red
    Write-Host "📥 Устанавливаем expo-notifications..." -ForegroundColor Yellow
    
    npm install expo-notifications
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка установки expo-notifications" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ expo-notifications установлен" -ForegroundColor Green
} else {
    Write-Host "✅ expo-notifications уже установлен" -ForegroundColor Green
}

Write-Host ""

# Проверка Firebase конфигурации
Write-Host "🔥 Проверка Firebase конфигурации..." -ForegroundColor Yellow

$googleServicesPath = Join-Path $mobileDir "google-services.json"
$hasGoogleServices = Test-Path $googleServicesPath

if (-not $hasGoogleServices) {
    Write-Host "⚠️  google-services.json не найден" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Инструкция по получению google-services.json:" -ForegroundColor Cyan
    Write-Host "1. Откройте Firebase Console: https://console.firebase.google.com/" -ForegroundColor White
    Write-Host "2. Выберите ваш проект или создайте новый" -ForegroundColor White
    Write-Host "3. Перейдите в Project Settings (⚙️)" -ForegroundColor White
    Write-Host "4. Выберите вкладку 'General'" -ForegroundColor White
    Write-Host "5. В разделе 'Your apps' нажмите на Android иконку" -ForegroundColor White
    Write-Host "6. Скачайте google-services.json" -ForegroundColor White
    Write-Host "7. Поместите файл в папку mobile/" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "У вас есть google-services.json? (y/n)"
    
    if ($continue -eq "y") {
        Write-Host "📂 Укажите путь к google-services.json:" -ForegroundColor Yellow
        $sourcePath = Read-Host "Путь"
        
        if (Test-Path $sourcePath) {
            Copy-Item $sourcePath $googleServicesPath
            Write-Host "✅ google-services.json скопирован" -ForegroundColor Green
        } else {
            Write-Host "❌ Файл не найден: $sourcePath" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "⚠️  Пропускаем настройку Firebase для Android" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ google-services.json найден" -ForegroundColor Green
}

Write-Host ""

# Создание примера кода для Push Notifications
Write-Host "📝 Создание примера кода..." -ForegroundColor Yellow

$pushServicePath = Join-Path $mobileDir "src" "services" "pushNotifications.ts"
$pushServiceDir = Split-Path $pushServicePath -Parent

if (-not (Test-Path $pushServiceDir)) {
    New-Item -ItemType Directory -Path $pushServiceDir -Force | Out-Null
}

$pushServiceContent = @'
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Конфигурация поведения уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Регистрация устройства для получения Push-уведомлений
 * @returns Expo Push Token или null
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log('Push token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Отправка локального уведомления (для тестирования)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Отправить немедленно
  });
}

/**
 * Отмена всех уведомлений
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Получение количества непрочитанных уведомлений (badge)
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Установка количества непрочитанных уведомлений (badge)
 */
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Очистка badge
 */
export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}
'@

Set-Content -Path $pushServicePath -Value $pushServiceContent -Encoding UTF8

Write-Host "✅ Создан файл: src/services/pushNotifications.ts" -ForegroundColor Green

Write-Host ""

# Создание примера использования в App.tsx
Write-Host "📝 Создание примера использования..." -ForegroundColor Yellow

$examplePath = Join-Path $mobileDir "src" "examples" "PushNotificationsExample.tsx"
$exampleDir = Split-Path $examplePath -Parent

if (-not (Test-Path $exampleDir)) {
    New-Item -ItemType Directory -Path $exampleDir -Force | Out-Null
}

$exampleContent = @'
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  sendLocalNotification,
  clearBadge,
} from '../services/pushNotifications';

export default function PushNotificationsExample() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Регистрация для Push-уведомлений
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // Слушатель входящих уведомлений
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setNotification(notification);
    });

    // Слушатель нажатий на уведомления
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      // Здесь можно обработать навигацию на основе data
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const handleSendTestNotification = async () => {
    await sendLocalNotification(
      'Тестовое уведомление',
      'Это локальное уведомление для тестирования',
      { screen: 'Home', orderId: '123' }
    );
  };

  const handleClearBadge = async () => {
    await clearBadge();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Push Notifications Example</Text>
      
      {expoPushToken && (
        <View style={styles.tokenContainer}>
          <Text style={styles.label}>Expo Push Token:</Text>
          <Text style={styles.token}>{expoPushToken}</Text>
        </View>
      )}

      {notification && (
        <View style={styles.notificationContainer}>
          <Text style={styles.label}>Last Notification:</Text>
          <Text style={styles.notificationText}>
            {notification.request.content.title}
          </Text>
          <Text style={styles.notificationText}>
            {notification.request.content.body}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Отправить тестовое уведомление"
          onPress={handleSendTestNotification}
        />
        <Button
          title="Очистить badge"
          onPress={handleClearBadge}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tokenContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  token: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  notificationContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 5,
  },
  notificationText: {
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    gap: 10,
  },
});
'@

Set-Content -Path $examplePath -Value $exampleContent -Encoding UTF8

Write-Host "✅ Создан файл: src/examples/PushNotificationsExample.tsx" -ForegroundColor Green

Write-Host ""

# Итоговая информация
Write-Host "✅ Push Notifications настроены!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Firebase Cloud Messaging (FCM):" -ForegroundColor Yellow
Write-Host "   - Откройте Firebase Console" -ForegroundColor White
Write-Host "   - Перейдите в Cloud Messaging" -ForegroundColor White
Write-Host "   - Скопируйте Server Key" -ForegroundColor White
Write-Host "   - Добавьте его в backend/.env как FIREBASE_SERVER_KEY" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Apple Push Notification Service (APNs):" -ForegroundColor Yellow
Write-Host "   - EAS автоматически настроит APNs при первой iOS сборке" -ForegroundColor White
Write-Host "   - Или настройте вручную в Apple Developer Portal" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Тестирование:" -ForegroundColor Yellow
Write-Host "   - Используйте PushNotificationsExample.tsx для тестирования" -ForegroundColor White
Write-Host "   - Отправьте тестовое уведомление через Expo Push Tool:" -ForegroundColor White
Write-Host "     https://expo.dev/notifications" -ForegroundColor Cyan
Write-Host ""
Write-Host "4️⃣  Backend интеграция:" -ForegroundColor Yellow
Write-Host "   - Сохраняйте Expo Push Token пользователя в БД" -ForegroundColor White
Write-Host "   - Используйте Expo Push API для отправки уведомлений" -ForegroundColor White
Write-Host "   - Документация: https://docs.expo.dev/push-notifications/sending-notifications/" -ForegroundColor Cyan
Write-Host ""
