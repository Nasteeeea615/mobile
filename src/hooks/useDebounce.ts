import { useState, useEffect } from 'react';

/**
 * Hook для debounce значения
 * Полезен для поисковых запросов
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Пример использования:
 * 
 * function SearchComponent() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Выполнить поиск только после 500ms с последнего изменения
 *       searchAPI(debouncedSearchTerm);
 *     }
 *   }, [debouncedSearchTerm]);
 * 
 *   return (
 *     <TextInput
 *       value={searchTerm}
 *       onChangeText={setSearchTerm}
 *       placeholder="Поиск..."
 *     />
 *   );
 * }
 */
