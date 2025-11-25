import { useForm, UseFormProps, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbarHelpers } from '../components/SnackbarProvider';

/**
 * Кастомный хук для форм с валидацией через Yup
 * Автоматически показывает ошибки через snackbar
 */
export function useValidatedForm<TFieldValues extends FieldValues = FieldValues>(
  schema: yup.AnyObjectSchema,
  options?: Omit<UseFormProps<TFieldValues>, 'resolver'>
) {
  const { showError } = useSnackbarHelpers();

  const form = useForm<TFieldValues>({
    ...options,
    resolver: yupResolver(schema),
    mode: options?.mode || 'onBlur', // Валидация при потере фокуса
  });

  /**
   * Обертка над handleSubmit с автоматической обработкой ошибок
   */
  const handleSubmitWithErrors = (
    onValid: (data: TFieldValues) => void | Promise<void>,
    onInvalid?: (errors: any) => void
  ) => {
    return form.handleSubmit(
      onValid,
      errors => {
        // Показываем первую ошибку
        const firstError = Object.values(errors)[0];
        if (firstError?.message) {
          showError(firstError.message as string);
        }

        // Вызываем кастомный обработчик если есть
        if (onInvalid) {
          onInvalid(errors);
        }
      }
    );
  };

  return {
    ...form,
    handleSubmitWithErrors,
  };
}
