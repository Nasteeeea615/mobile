# Septik Service Mobile App

Мобильное приложение для заказа услуг по откачке септика на React Native (Expo).

## Структура проекта

```
mobile/
├── src/
│   ├── components/     # Переиспользуемые компоненты
│   ├── screens/        # Экраны приложения
│   ├── services/       # API сервисы
│   ├── store/          # Redux store и slices
│   ├── types/          # TypeScript типы
│   └── utils/          # Утилиты
├── App.tsx             # Главный компонент
└── package.json
```

## Установка

```bash
npm install
```

## Запуск

```bash
# Запуск на Android
npm run android

# Запуск на iOS (только на macOS)
npm run ios

# Запуск в веб-браузере
npm run web

# Запуск Expo Dev Server
npm start
```

## Технологии

- **React Native** с Expo SDK
- **TypeScript** для типизации
- **Redux Toolkit** для управления состоянием
- **React Navigation** для навигации
- **React Native Paper** для UI компонентов
- **Axios** для HTTP запросов

## Конфигурация

Скопируйте `.env.example` в `.env` и настройте переменные окружения:

```bash
cp .env.example .env
```

## Разработка

- ESLint и Prettier настроены для поддержания качества кода
- Используйте TypeScript для всех новых файлов
- Следуйте структуре папок проекта
