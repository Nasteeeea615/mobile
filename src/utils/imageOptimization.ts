import { Image, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Утилиты для оптимизации изображений
 */

/**
 * Кэш для изображений
 */
const imageCache = new Map<string, string>();

/**
 * Предзагрузка изображений
 */
export const preloadImages = async (uris: string[]): Promise<void> => {
  try {
    await Promise.all(
      uris.map(uri => Image.prefetch(uri))
    );
  } catch (error) {
    console.error('Failed to preload images:', error);
  }
};

/**
 * Получить оптимальный размер изображения
 */
export const getOptimalImageSize = (
  containerWidth: number,
  containerHeight: number,
  pixelRatio: number = 2
): { width: number; height: number } => {
  return {
    width: Math.ceil(containerWidth * pixelRatio),
    height: Math.ceil(containerHeight * pixelRatio),
  };
};

/**
 * Создать URL с параметрами размера (для CDN)
 */
export const getResizedImageUrl = (
  url: string,
  width: number,
  height: number
): string => {
  // Пример для различных CDN:
  
  // Cloudinary
  // return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill/`);
  
  // imgix
  // return `${url}?w=${width}&h=${height}&fit=crop`;
  
  // Для локальных изображений возвращаем как есть
  return url;
};

/**
 * Кэширование изображений локально
 */
export const cacheImage = async (uri: string): Promise<string> => {
  // Проверить кэш
  if (imageCache.has(uri)) {
    return imageCache.get(uri)!;
  }

  try {
    // Создать имя файла из URI
    const filename = uri.split('/').pop() || 'image';
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    // Проверить существование файла
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (fileInfo.exists) {
      imageCache.set(uri, fileUri);
      return fileUri;
    }

    // Скачать и сохранить
    const downloadResult = await FileSystem.downloadAsync(uri, fileUri);
    
    if (downloadResult.status === 200) {
      imageCache.set(uri, downloadResult.uri);
      return downloadResult.uri;
    }

    return uri;
  } catch (error) {
    console.error('Failed to cache image:', error);
    return uri;
  }
};

/**
 * Очистить кэш изображений
 */
export const clearImageCache = async (): Promise<void> => {
  try {
    imageCache.clear();
    
    if (FileSystem.cacheDirectory) {
      const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
      
      await Promise.all(
        files
          .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
          .map(file => 
            FileSystem.deleteAsync(`${FileSystem.cacheDirectory}${file}`, {
              idempotent: true,
            })
          )
      );
    }
  } catch (error) {
    console.error('Failed to clear image cache:', error);
  }
};

/**
 * Получить размер кэша изображений
 */
export const getImageCacheSize = async (): Promise<number> => {
  try {
    if (!FileSystem.cacheDirectory) {
      return 0;
    }

    const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
    let totalSize = 0;

    for (const file of files) {
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
        const fileInfo = await FileSystem.getInfoAsync(
          `${FileSystem.cacheDirectory}${file}`
        );
        if (fileInfo.exists && 'size' in fileInfo) {
          totalSize += fileInfo.size;
        }
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Failed to get cache size:', error);
    return 0;
  }
};

/**
 * Форматировать размер в читаемый вид
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Компонент оптимизированного изображения
 * 
 * Пример использования:
 * 
 * import { Image } from 'react-native';
 * import { getResizedImageUrl, cacheImage } from './imageOptimization';
 * 
 * function OptimizedImage({ uri, width, height }) {
 *   const [cachedUri, setCachedUri] = useState(uri);
 * 
 *   useEffect(() => {
 *     cacheImage(uri).then(setCachedUri);
 *   }, [uri]);
 * 
 *   const resizedUri = getResizedImageUrl(cachedUri, width, height);
 * 
 *   return (
 *     <Image
 *       source={{ uri: resizedUri }}
 *       style={{ width, height }}
 *       resizeMode="cover"
 *     />
 *   );
 * }
 */

/**
 * Best practices для изображений:
 * 
 * 1. Используйте правильный формат:
 *    - JPEG для фотографий
 *    - PNG для изображений с прозрачностью
 *    - WebP для лучшего сжатия (если поддерживается)
 * 
 * 2. Оптимизируйте размер:
 *    - Не загружайте изображения больше, чем нужно
 *    - Используйте CDN с автоматическим ресайзом
 * 
 * 3. Используйте кэширование:
 *    - Локальное кэширование для часто используемых изображений
 *    - HTTP кэширование через headers
 * 
 * 4. Lazy loading:
 *    - Загружайте изображения только когда они видны
 *    - Используйте placeholder пока загружается
 * 
 * 5. Progressive loading:
 *    - Сначала показывайте низкое качество
 *    - Затем загружайте полное качество
 */
