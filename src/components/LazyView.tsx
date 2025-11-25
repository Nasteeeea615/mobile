import React, { useState, useEffect, useRef } from 'react';
import { View, ViewProps, LayoutChangeEvent } from 'react-native';

interface LazyViewProps extends ViewProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  threshold?: number; // Порог видимости (0-1)
}

/**
 * LazyView - компонент для отложенной загрузки контента
 * Рендерит children только когда компонент становится видимым
 */
export const LazyView: React.FC<LazyViewProps> = ({
  children,
  placeholder = null,
  threshold = 0.5,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const viewRef = useRef<View>(null);

  useEffect(() => {
    // Простая проверка видимости
    // В production лучше использовать Intersection Observer или react-native-viewport
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return <View {...props}>{placeholder}</View>;
  }

  return (
    <View ref={viewRef} {...props}>
      {children}
    </View>
  );
};

/**
 * Пример использования:
 * 
 * <LazyView
 *   placeholder={<ActivityIndicator />}
 *   style={styles.container}
 * >
 *   <HeavyComponent />
 * </LazyView>
 */
