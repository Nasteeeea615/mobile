/**
 * Утилиты для оптимизации производительности
 */

/**
 * Debounce - откладывает выполнение функции до тех пор,
 * пока не пройдет указанное время с последнего вызова
 * 
 * Используется для: поиск, автосохранение, resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle - ограничивает частоту вызова функции
 * Функция будет вызвана максимум раз в указанный период
 * 
 * Используется для: scroll events, resize, mouse move
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoization - кэширование результатов функции
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Очистка кэша memoize функции
 */
export function clearMemoizeCache<T extends (...args: any[]) => any>(
  memoizedFunc: T
): void {
  if ((memoizedFunc as any).cache) {
    (memoizedFunc as any).cache.clear();
  }
}

/**
 * Lazy load - отложенная загрузка
 */
export function lazyLoad<T>(
  loader: () => Promise<T>
): () => Promise<T> {
  let cached: T | null = null;
  let loading: Promise<T> | null = null;

  return async () => {
    if (cached) {
      return cached;
    }

    if (loading) {
      return loading;
    }

    loading = loader();
    cached = await loading;
    loading = null;

    return cached;
  };
}

/**
 * Batch - группировка операций
 */
export class Batcher<T, R> {
  private queue: Array<{
    item: T;
    resolve: (value: R) => void;
    reject: (error: any) => void;
  }> = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchFn: (items: T[]) => Promise<R[]>;
  private wait: number;

  constructor(batchFn: (items: T[]) => Promise<R[]>, wait: number = 50) {
    this.batchFn = batchFn;
    this.wait = wait;
  }

  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        this.flush();
      }, this.wait);
    });
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    const batch = this.queue.splice(0);
    const items = batch.map(b => b.item);

    try {
      const results = await this.batchFn(items);
      
      batch.forEach((b, index) => {
        b.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(b => {
        b.reject(error);
      });
    }
  }
}

/**
 * Request Animation Frame throttle
 * Для оптимизации анимаций
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (rafId !== null) {
      return;
    }

    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
}

/**
 * Измерение производительности
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  start(label: string): void {
    this.marks.set(label, Date.now());
  }

  end(label: string): number {
    const start = this.marks.get(label);
    if (!start) {
      console.warn(`Performance mark "${label}" not found`);
      return 0;
    }

    const duration = Date.now() - start;
    this.marks.delete(label);

    if (__DEV__) {
      console.log(`[Performance] ${label}: ${duration}ms`);
    }

    return duration;
  }

  measure(label: string, fn: () => void): number {
    this.start(label);
    fn();
    return this.end(label);
  }

  async measureAsync(label: string, fn: () => Promise<void>): Promise<number> {
    this.start(label);
    await fn();
    return this.end(label);
  }
}

/**
 * Глобальный performance monitor
 */
export const perfMonitor = new PerformanceMonitor();

/**
 * Примеры использования:
 * 
 * // Debounce для поиска
 * const debouncedSearch = debounce((query: string) => {
 *   searchAPI(query);
 * }, 300);
 * 
 * // Throttle для scroll
 * const throttledScroll = throttle(() => {
 *   updateScrollPosition();
 * }, 100);
 * 
 * // Memoize для вычислений
 * const expensiveCalculation = memoize((a: number, b: number) => {
 *   return a * b * Math.random();
 * });
 * 
 * // Lazy load для компонентов
 * const loadHeavyComponent = lazyLoad(() => import('./HeavyComponent'));
 * 
 * // Batch для API запросов
 * const userBatcher = new Batcher(async (userIds: string[]) => {
 *   return await fetchUsers(userIds);
 * });
 * 
 * // Performance monitoring
 * perfMonitor.start('api-call');
 * await fetchData();
 * perfMonitor.end('api-call');
 */
