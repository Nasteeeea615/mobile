import * as yup from 'yup';

/**
 * Схемы валидации для форм приложения
 */

// Валидация номера телефона (российский формат)
export const phoneSchema = yup
  .string()
  .required('Номер телефона обязателен')
  .matches(/^(\+7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/, 
    'Неверный формат номера телефона');

// Валидация SMS кода
export const smsCodeSchema = yup
  .string()
  .required('Код подтверждения обязателен')
  .matches(/^[0-9]{4,6}$/, 'Код должен содержать 4-6 цифр');

// Валидация имени
export const nameSchema = yup
  .string()
  .required('Имя обязательно')
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(50, 'Имя не должно превышать 50 символов')
  .matches(/^[а-яА-ЯёЁa-zA-Z\s-]+$/, 'Имя может содержать только буквы, пробелы и дефисы');

// Валидация адреса
export const addressSchema = yup.object({
  city: yup
    .string()
    .required('Город обязателен')
    .min(2, 'Название города должно содержать минимум 2 символа')
    .max(100, 'Название города не должно превышать 100 символов'),
  street: yup
    .string()
    .required('Улица обязательна')
    .min(2, 'Название улицы должно содержать минимум 2 символа')
    .max(200, 'Название улицы не должно превышать 200 символов'),
  houseNumber: yup
    .string()
    .required('Номер дома обязателен')
    .max(20, 'Номер дома не должен превышать 20 символов'),
});

// Валидация регистрации клиента
export const clientRegistrationSchema = yup.object({
  phoneNumber: phoneSchema,
  name: nameSchema,
  city: yup.string().required('Город обязателен'),
  street: yup.string().required('Улица обязательна'),
  houseNumber: yup.string().required('Номер дома обязателен'),
  agreedToTerms: yup
    .boolean()
    .oneOf([true], 'Необходимо согласиться с условиями использования'),
});

// Валидация регистрации исполнителя
export const executorRegistrationSchema = yup.object({
  phoneNumber: phoneSchema,
  name: nameSchema,
  vehicleNumber: yup
    .string()
    .required('Номер машины обязателен')
    .matches(/^[А-ЯA-Z0-9\s-]+$/i, 'Неверный формат номера машины')
    .max(50, 'Номер машины не должен превышать 50 символов'),
  vehicleCapacity: yup
    .number()
    .required('Объем машины обязателен')
    .oneOf([3, 5, 10], 'Объем должен быть 3, 5 или 10 м³'),
  agreedToTerms: yup
    .boolean()
    .oneOf([true], 'Необходимо согласиться с условиями использования'),
});

// Валидация создания заказа
export const createOrderSchema = yup.object({
  vehicleCapacity: yup
    .number()
    .required('Выберите объем машины')
    .oneOf([3, 5, 10], 'Объем должен быть 3, 5 или 10 м³'),
  address: addressSchema,
  scheduledDate: yup
    .date()
    .required('Дата обязательна')
    .min(new Date(), 'Дата не может быть в прошлом'),
  scheduledTime: yup
    .string()
    .required('Время обязательно')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Неверный формат времени (ЧЧ:ММ)'),
  comment: yup
    .string()
    .max(500, 'Комментарий не должен превышать 500 символов'),
  isUrgent: yup.boolean(),
});

// Валидация редактирования профиля
export const editProfileSchema = yup.object({
  name: nameSchema,
  city: yup.string().required('Город обязателен'),
  street: yup.string().required('Улица обязательна'),
  houseNumber: yup.string().required('Номер дома обязателен'),
});

// Валидация создания тикета поддержки
export const createTicketSchema = yup.object({
  subject: yup
    .string()
    .required('Тема обращения обязательна')
    .min(5, 'Тема должна содержать минимум 5 символов')
    .max(200, 'Тема не должна превышать 200 символов'),
  description: yup
    .string()
    .required('Описание проблемы обязательно')
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(2000, 'Описание не должно превышать 2000 символов'),
});

// Валидация данных карты (базовая)
export const paymentCardSchema = yup.object({
  cardNumber: yup
    .string()
    .required('Номер карты обязателен')
    .matches(/^[0-9]{16}$/, 'Номер карты должен содержать 16 цифр'),
  expiryDate: yup
    .string()
    .required('Срок действия обязателен')
    .matches(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, 'Неверный формат (ММ/ГГ)'),
  cvv: yup
    .string()
    .required('CVV код обязателен')
    .matches(/^[0-9]{3,4}$/, 'CVV должен содержать 3-4 цифры'),
  cardholderName: yup
    .string()
    .required('Имя держателя карты обязательно')
    .matches(/^[A-Z\s]+$/i, 'Имя должно содержать только латинские буквы'),
});

/**
 * Хелпер для форматирования ошибок валидации
 */
export const formatValidationError = (error: yup.ValidationError): string => {
  return error.errors.join(', ');
};

/**
 * Хелпер для проверки валидности поля
 */
export const validateField = async (
  schema: yup.AnySchema,
  value: any
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    await schema.validate(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { isValid: false, error: error.message };
    }
    return { isValid: false, error: 'Ошибка валидации' };
  }
};
