# 📱 Septik Service Mobile App

React Native приложение для заказа услуг ассенизаторской машины.

## 🚀 Быстрый старт

### Разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start

# Запуск на Android
npm run android

# Запуск на iOS
npm run ios
```

### Сборка и публикация

```bash
# Настройка EAS Build
npm run setup:eas

# Настройка Push-уведомлений
npm run setup:push

# Тестовая сборка Android
npm run build:preview:android

# Тестовая сборка iOS
npm run build:preview:ios

# Production сборка
npm run build:production:android
npm run build:production:ios

# Публикация в магазины
npm run submit:android
npm run submit:ios

# OTA Update
npm run update:production
```

## 📚 Документация

- [Полное руководство по Native Mobile](../docs/STAGE_5_NATIVE_MOBILE.md)
- [Быстрый старт (40 минут)](../docs/STAGE_5_QUICK_START.md)
- [Документ завершения этапа](../docs/STAGE_5_COMPLETE.md)

## 🏗️ Технологии

- **React Native:** 0.81.5
- **Expo SDK:** ~54.0.23
- **TypeScript:** ~5.9.2
- **React Navigation:** 7.x
- **Redux Toolkit:** 2.x
- **React Hook Form:** 7.x
- **Expo Notifications:** Push-уведомления

## 📦 Структура проекта

```
mobile/
├── src/
│   ├── components/      # Переиспользуемые компоненты
│   ├── screens/         # Экраны приложения
│   ├── navigation/      # Навигация
│   ├── services/        # API и сервисы
│   ├── store/           # Redux store
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Утилиты
│   ├── types/           # TypeScript типы
│   └── theme/           # Тема и стили
├── assets/              # Изображения и ресурсы
├── scripts/             # Скрипты настройки
├── app.json             # Expo конфигурация
├── eas.json             # EAS Build конфигурация
└── package.json         # Зависимости
```

## 🔐 Переменные окружения

Создайте файл `.env`:

```env
API_URL=http://localhost:3000/api
WS_URL=ws://localhost:3000
PAYMENT_GATEWAY_API_KEY=your_key
```

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Запуск с покрытием
npm run test:coverage
```

## 📱 Поддерживаемые платформы

- **Android:** API 21+ (Android 5.0+)
- **iOS:** iOS 13.4+

## 🔔 Push-уведомления

Push-уведомления настроены через Expo Notifications + Firebase:

1. Добавьте `google-services.json` (Android)
2. Добавьте `GoogleService-Info.plist` (iOS)
3. Запустите `npm run setup:push`

Подробнее: [docs/STAGE_5_NATIVE_MOBILE.md](../docs/STAGE_5_NATIVE_MOBILE.md)

## 🚢 Публикация

### Google Play Store

1. Создайте аккаунт в [Google Play Console](https://play.google.com/console)
2. Создайте приложение
3. Заполните Store Listing
4. Запустите `npm run build:production:android`
5. Запустите `npm run submit:android`

### App Store

1. Зарегистрируйтесь в [Apple Developer Program](https://developer.apple.com/programs/) ($99/год)
2. Создайте App ID
3. Создайте приложение в [App Store Connect](https://appstoreconnect.apple.com/)
4. Запустите `npm run build:production:ios`
5. Отправьте на App Review через App Store Connect

## 🔄 OTA Updates

Обновляйте JavaScript код без пересборки:

```bash
npm run update:production
```

⚠️ Нельзя обновить нативный код или permissions через OTA.

## 🆘 Troubleshooting

### Build failed на EAS

1. Проверьте логи в [EAS Dashboard](https://expo.dev/)
2. Очистите кэш: `eas build --clear-cache`
3. Проверьте app.json и eas.json

### Push-уведомления не приходят

1. Проверьте наличие google-services.json
2. Тестируйте на реальном устройстве
3. Проверьте Expo Push Token в консоли

## 📞 Поддержка

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Notifications](https://docs.expo.dev/push-notifications/overview/)

## 📄 Лицензия

Proprietary
