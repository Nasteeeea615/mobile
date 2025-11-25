# Design System

Единая система дизайна для мобильного приложения септик-сервиса.

## Обзор

Дизайн-система построена на основе React Native Paper (Material Design 3) с кастомизацией под требования проекта. Поддерживает светлую и темную темы с плавными переходами.

## Цветовая схема

### Светлая тема
- **Primary**: #2196F3 (синий) - основной цвет для кнопок и акцентов
- **Secondary**: #4CAF50 (зеленый) - для успешных действий и цен
- **Background**: #FFFFFF (белый) - фон приложения
- **Surface**: #F5F5F5 (светло-серый) - карточки и поверхности
- **Text**: #212121 (почти черный) - основной текст
- **Text Secondary**: #666666 (серый) - вторичный текст

### Темная тема
- **Primary**: #64B5F6 (светло-синий)
- **Secondary**: #81C784 (светло-зеленый)
- **Background**: #121212 (почти черный)
- **Surface**: #1E1E1E (темно-серый)
- **Text**: #FFFFFF (белый)
- **Text Secondary**: #B0B0B0 (светло-серый)

## Типографика

### Размеры шрифтов
- **xs**: 12px - мелкий текст, метки
- **sm**: 14px - вторичный текст
- **md**: 16px - основной текст
- **lg**: 18px - подзаголовки
- **xl**: 20px - заголовки
- **xxl**: 24px - крупные заголовки
- **xxxl**: 32px - главные заголовки

### Веса шрифтов
- **regular**: 400 - обычный текст
- **medium**: 500 - средний акцент
- **semibold**: 600 - полужирный
- **bold**: 700 - жирный для заголовков

## Отступы (Spacing)

```typescript
spacing = {
  xs: 4,   // минимальные отступы
  sm: 8,   // малые отступы
  md: 16,  // стандартные отступы
  lg: 24,  // большие отступы
  xl: 32,  // очень большие отступы
  xxl: 48, // максимальные отступы
}
```

## Компоненты

### CustomButton

Кастомная кнопка с поддержкой разных размеров и режимов.

```tsx
import { CustomButton } from '../components';

<CustomButton
  onPress={handlePress}
  mode="contained"  // 'text' | 'outlined' | 'contained' | 'elevated'
  size="medium"     // 'small' | 'medium' | 'large'
  loading={false}
  disabled={false}
  fullWidth={false}
  icon="check"
>
  Нажми меня
</CustomButton>
```

**Размеры кнопок:**
- **small**: 44px высота (минимум для удобного нажатия)
- **medium**: 48px высота
- **large**: 56px высота

### CustomInput

Кастомное поле ввода с валидацией и ошибками.

```tsx
import { CustomInput } from '../components';

<CustomInput
  label="Имя"
  value={name}
  onChangeText={setName}
  placeholder="Введите имя"
  mode="outlined"  // 'flat' | 'outlined'
  error={!!errors.name}
  errorText={errors.name}
  keyboardType="default"
  multiline={false}
/>
```

### CustomCard

Кастомная карточка с тенями.

```tsx
import { CustomCard } from '../components';

<CustomCard
  onPress={handlePress}
  elevation="medium"  // 'small' | 'medium' | 'large'
>
  <Text>Содержимое карточки</Text>
</CustomCard>
```

### ThemeToggle

Переключатель темы оформления.

```tsx
import { ThemeToggle } from '../components';

<ThemeToggle showLabel={true} />
```

### VehicleSelector

Компонент выбора объема машины.

```tsx
import { VehicleSelector } from '../components';

<VehicleSelector
  selectedCapacity={capacity}
  onSelect={setCapacity}
/>
```

### OrderCard

Карточка заказа с информацией.

```tsx
import { OrderCard } from '../components';

<OrderCard
  order={order}
  onPress={() => navigateToDetails(order.id)}
/>
```

### ConfirmationModal

Модальное окно подтверждения действия.

```tsx
import { ConfirmationModal } from '../components';

<ConfirmationModal
  visible={showModal}
  title="Подтверждение"
  message="Вы уверены?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  confirmText="Да"
  cancelText="Нет"
  loading={false}
/>
```

## Использование темы

### В компонентах

```tsx
import { useTheme } from 'react-native-paper';
import { AppTheme, spacing, borderRadius } from '../theme';

function MyComponent() {
  const theme = useTheme<AppTheme>();

  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
    }}>
      <Text style={{ color: theme.colors.onSurface }}>
        Текст
      </Text>
    </View>
  );
}
```

### Переключение темы

```tsx
import { useDispatch } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';

function Settings() {
  const dispatch = useDispatch();

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return <ThemeToggle />;
}
```

## Тени (Shadows)

```typescript
shadows = {
  small: { elevation: 2 },   // легкая тень
  medium: { elevation: 4 },  // средняя тень
  large: { elevation: 8 },   // сильная тень
}
```

## Скругления (Border Radius)

```typescript
borderRadius = {
  sm: 4,    // минимальное
  md: 8,    // стандартное
  lg: 12,   // большое
  xl: 16,   // очень большое
  round: 999, // полностью круглое
}
```

## Анимации

Все переходы используют плавные анимации:
- Переключение темы - мгновенное
- Модальные окна - fade in/out
- Навигация - стандартные переходы React Navigation

## Accessibility

- Минимальный размер кнопок: 44x44px
- Контрастность текста соответствует WCAG AA
- Поддержка screen readers
- Семантические элементы

## Best Practices

1. **Всегда используйте константы** из theme вместо хардкода цветов
2. **Используйте spacing** для отступов вместо магических чисел
3. **Используйте CustomButton** вместо обычного Button для единообразия
4. **Тестируйте в обеих темах** - светлой и темной
5. **Минимальный размер touch target** - 44x44px

## Примеры использования

### Экран с формой

```tsx
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { CustomInput, CustomButton } from '../components';
import { AppTheme, spacing } from '../theme';

function FormScreen() {
  const theme = useTheme<AppTheme>();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>
        Заголовок формы
      </Text>
      
      <CustomInput
        label="Имя"
        value={name}
        onChangeText={setName}
      />
      
      <CustomInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      
      <CustomButton
        onPress={handleSubmit}
        mode="contained"
        size="large"
        fullWidth
      >
        Отправить
      </CustomButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.lg,
  },
});
```

## Поддержка

При возникновении вопросов или предложений по улучшению дизайн-системы, обращайтесь к команде разработки.
