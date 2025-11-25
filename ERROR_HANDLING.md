# Обработка ошибок и валидация

Документация по системе обработки ошибок и валидации данных в мобильном приложении.

## Обзор

Система обработки ошибок включает:
- **ErrorBoundary** - перехват ошибок React
- **Axios Interceptors** - обработка HTTP ошибок
- **Snackbar/Toast** - уведомления пользователя
- **React Hook Form + Yup** - валидация форм
- **Retry Logic** - автоматические повторные попытки

## ErrorBoundary

ErrorBoundary перехватывает ошибки React и предотвращает крах всего приложения.

### Использование

```tsx
import ErrorBoundary from './components/ErrorBoundary';

// Обернуть все приложение
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Или отдельный компонент с кастомным fallback
<ErrorBoundary fallback={<CustomErrorScreen />}>
  <MyComponent />
</ErrorBoundary>
```

### Что перехватывает

- Ошибки рендеринга компонентов
- Ошибки в lifecycle методах
- Ошибки в конструкторах

### Что НЕ перехватывает

- Ошибки в event handlers (используйте try-catch)
- Асинхронные ошибки (используйте try-catch или .catch())
- Ошибки в SSR
- Ошибки в самом ErrorBoundary

## API Error Handling

### Axios Interceptors

API сервис автоматически обрабатывает HTTP ошибки:

```typescript
import apiService from './services/api';

// Установить callback для ошибок
apiService.setErrorCallback((error) => {
  showErrorToast(error.message);
});

// Использовать API
try {
  const data = await apiService.get('/orders');
} catch (error) {
  // Ошибка уже обработана interceptor
  console.error(error);
}
```

### Типы ошибок

```typescript
enum ErrorType {
  NETWORK = 'NETWORK_ERROR',        // Нет интернета
  TIMEOUT = 'TIMEOUT_ERROR',        // Превышено время ожидания
  UNAUTHORIZED = 'UNAUTHORIZED',    // 401
  FORBIDDEN = 'FORBIDDEN',          // 403
  NOT_FOUND = 'NOT_FOUND',          // 404
  VALIDATION = 'VALIDATION_ERROR',  // 400
  SERVER = 'SERVER_ERROR',          // 500+
  UNKNOWN = 'UNKNOWN_ERROR',        // Неизвестная ошибка
}
```

### Retry Logic

API автоматически повторяет запросы при сетевых ошибках:
- Максимум 2 повторные попытки
- Exponential backoff (1с, 2с)
- Только для сетевых ошибок

## Toast Notifications

### Простые Toast (Android/iOS Alert)

```typescript
import { showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from './utils/toast';

// Успех
showSuccessToast('Заказ создан успешно');

// Ошибка
showErrorToast('Не удалось создать заказ');

// Предупреждение
showWarningToast('Проверьте введенные данные');

// Информация
showInfoToast('Заказ в обработке');

// С длительностью
showSuccessToast('Сохранено', 'long');
```

### Snackbar (React Native Paper)

Более красивые уведомления с автоматическим скрытием:

```typescript
import { useSnackbarHelpers } from './components/SnackbarProvider';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbarHelpers();

  const handleSubmit = async () => {
    try {
      await createOrder();
      showSuccess('Заказ создан успешно');
    } catch (error) {
      showError('Не удалось создать заказ');
    }
  };

  return <Button onPress={handleSubmit}>Создать</Button>;
}
```

## Валидация форм

### React Hook Form + Yup

```typescript
import { useValidatedForm } from './hooks/useValidatedForm';
import { createOrderSchema } from './utils/validation';
import { CustomInput, CustomButton } from './components';

function OrderForm() {
  const {
    control,
    handleSubmitWithErrors,
    formState: { errors },
  } = useValidatedForm(createOrderSchema);

  const onSubmit = async (data) => {
    try {
      await createOrder(data);
      showSuccess('Заказ создан');
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <View>
      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomInput
            label="Город"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!errors.city}
            errorText={errors.city?.message}
          />
        )}
      />

      <CustomButton onPress={handleSubmitWithErrors(onSubmit)}>
        Создать заказ
      </CustomButton>
    </View>
  );
}
```

### Доступные схемы валидации

- `phoneSchema` - номер телефона
- `smsCodeSchema` - SMS код
- `nameSchema` - имя пользователя
- `addressSchema` - адрес
- `clientRegistrationSchema` - регистрация клиента
- `executorRegistrationSchema` - регистрация исполнителя
- `createOrderSchema` - создание заказа
- `editProfileSchema` - редактирование профиля
- `createTicketSchema` - создание тикета
- `paymentCardSchema` - данные карты

### Кастомная валидация

```typescript
import * as yup from 'yup';

const customSchema = yup.object({
  email: yup
    .string()
    .email('Неверный формат email')
    .required('Email обязателен'),
  age: yup
    .number()
    .min(18, 'Минимальный возраст 18 лет')
    .required('Возраст обязателен'),
});

const form = useValidatedForm(customSchema);
```

## Best Practices

### 1. Всегда оборачивайте async операции в try-catch

```typescript
// ❌ Плохо
const handleClick = async () => {
  const data = await apiService.get('/data');
  setData(data);
};

// ✅ Хорошо
const handleClick = async () => {
  try {
    const data = await apiService.get('/data');
    setData(data);
  } catch (error) {
    showError('Не удалось загрузить данные');
  }
};
```

### 2. Используйте валидацию на стороне клиента

```typescript
// ✅ Валидация перед отправкой
const form = useValidatedForm(schema);

const onSubmit = form.handleSubmitWithErrors(async (data) => {
  // Данные уже валидированы
  await apiService.post('/orders', data);
});
```

### 3. Показывайте понятные сообщения пользователю

```typescript
// ❌ Плохо
showError(error.code);

// ✅ Хорошо
const getUserFriendlyMessage = (error) => {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Проверьте подключение к интернету';
    case 'UNAUTHORIZED':
      return 'Необходимо войти в аккаунт';
    default:
      return 'Произошла ошибка. Попробуйте позже';
  }
};

showError(getUserFriendlyMessage(error));
```

### 4. Логируйте ошибки в dev режиме

```typescript
try {
  await someOperation();
} catch (error) {
  if (__DEV__) {
    console.error('Operation failed:', error);
  }
  showError('Операция не выполнена');
}
```

### 5. Используйте loading состояния

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await apiService.post('/orders', data);
    showSuccess('Заказ создан');
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
};

return <CustomButton loading={loading} onPress={handleSubmit}>Создать</CustomButton>;
```

## Тестирование

### Тестирование ErrorBoundary

```typescript
import { render } from '@testing-library/react-native';
import ErrorBoundary from './ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

test('catches errors and displays fallback', () => {
  const { getByText } = render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(getByText(/что-то пошло не так/i)).toBeTruthy();
});
```

### Тестирование валидации

```typescript
import { createOrderSchema } from './validation';

test('validates order data', async () => {
  const validData = {
    vehicleCapacity: 5,
    address: {
      city: 'Москва',
      street: 'Ленина',
      houseNumber: '1',
    },
    scheduledDate: new Date(),
    scheduledTime: '14:00',
  };

  await expect(createOrderSchema.validate(validData)).resolves.toBeTruthy();
});

test('rejects invalid order data', async () => {
  const invalidData = {
    vehicleCapacity: 7, // Неверный объем
  };

  await expect(createOrderSchema.validate(invalidData)).rejects.toThrow();
});
```

## Troubleshooting

### Ошибка не перехватывается ErrorBoundary

- Проверьте, что ошибка происходит в render методе
- Для event handlers используйте try-catch
- Для async операций используйте try-catch или .catch()

### Snackbar не показывается

- Убедитесь, что SnackbarProvider обернут вокруг компонента
- Проверьте, что используете useSnackbar внутри провайдера

### Валидация не работает

- Проверьте, что схема правильно импортирована
- Убедитесь, что используете Controller из react-hook-form
- Проверьте, что поля формы правильно связаны с control

### API ошибки не обрабатываются

- Убедитесь, что установлен errorCallback
- Проверьте, что используете apiService, а не axios напрямую
- Проверьте network tab в dev tools
