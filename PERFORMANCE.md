# Оптимизация производительности Mobile App

Руководство по оптимизации производительности React Native приложения.

## Обзор

Реализованные оптимизации:
- ✅ Debouncing и throttling
- ✅ Lazy loading компонентов
- ✅ Image optimization и caching
- ✅ Infinite scroll / pagination
- ✅ Memoization
- ✅ Performance monitoring

## Debouncing и Throttling

### useDebounce Hook

```typescript
import { useDebounce } from './hooks/useDebounce';

function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // API вызов только после 500ms с последнего изменения
      searchAPI(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <TextInput
      value={searchTerm}
      onChangeText={setSearchTerm}
      placeholder="Поиск..."
    />
  );
}
```

### Throttle для scroll events

```typescript
import { throttle } from './utils/performance';

const handleScroll = throttle((event) => {
  const offsetY = event.nativeEvent.contentOffset.y;
  updateScrollPosition(offsetY);
}, 100); // Максимум раз в 100ms

<ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
  {/* content */}
</ScrollView>
```

## Lazy Loading

### LazyView Component

```typescript
import { LazyView } from './components/LazyView';

function Screen() {
  return (
    <ScrollView>
      <LazyView placeholder={<ActivityIndicator />}>
        <HeavyComponent />
      </LazyView>
    </ScrollView>
  );
}
```

### React.lazy для navigation

```typescript
import React, { lazy, Suspense } from 'react';

// Lazy load экранов
const OrdersScreen = lazy(() => import('./screens/OrdersScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));

function Navigation() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Stack.Navigator>
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </Suspense>
  );
}
```

## Image Optimization

### Оптимизация размера

```typescript
import { getOptimalImageSize, getResizedImageUrl } from './utils/imageOptimization';

function ProductImage({ uri, containerWidth, containerHeight }) {
  const { width, height } = getOptimalImageSize(
    containerWidth,
    containerHeight,
    PixelRatio.get()
  );

  const optimizedUri = getResizedImageUrl(uri, width, height);

  return (
    <Image
      source={{ uri: optimizedUri }}
      style={{ width: containerWidth, height: containerHeight }}
      resizeMode="cover"
    />
  );
}
```

### Кэширование изображений

```typescript
import { cacheImage, preloadImages } from './utils/imageOptimization';

// Предзагрузка изображений
useEffect(() => {
  const imageUris = products.map(p => p.imageUrl);
  preloadImages(imageUris);
}, [products]);

// Кэширование отдельного изображения
const [cachedUri, setCachedUri] = useState(uri);

useEffect(() => {
  cacheImage(uri).then(setCachedUri);
}, [uri]);
```

### Fast Image (рекомендуется)

```bash
npm install react-native-fast-image
```

```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.immutable,
  }}
  style={{ width: 200, height: 200 }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

## Infinite Scroll / Pagination

### useInfiniteScroll Hook

```typescript
import { useInfiniteScroll } from './hooks/useInfiniteScroll';

function OrdersList() {
  const { data, loading, hasMore, loadMore, refresh } = useInfiniteScroll(
    async (page) => {
      const response = await apiService.get(`/orders?page=${page}&limit=20`);
      return {
        data: response.data,
        hasMore: response.pagination.hasNext,
      };
    }
  );

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <OrderCard order={item} />}
      keyExtractor={item => item.id}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshing={loading}
      onRefresh={refresh}
      ListFooterComponent={
        loading && hasMore ? <ActivityIndicator /> : null
      }
    />
  );
}
```

## FlatList Optimization

### Оптимизация рендеринга

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  
  // Оптимизации
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={5}
  
  // Мемоизация
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Мемоизация компонентов

```typescript
import React, { memo } from 'react';

const OrderCard = memo(({ order }) => {
  return (
    <View>
      <Text>{order.id}</Text>
      <Text>{order.status}</Text>
    </View>
  );
}, (prevProps, nextProps) => {
  // Рендерить только если order изменился
  return prevProps.order.id === nextProps.order.id &&
         prevProps.order.status === nextProps.order.status;
});
```

## React Hooks Optimization

### useMemo

```typescript
import { useMemo } from 'react';

function OrdersList({ orders, filter }) {
  // Мемоизация вычислений
  const filteredOrders = useMemo(() => {
    return orders.filter(order => order.status === filter);
  }, [orders, filter]);

  return <FlatList data={filteredOrders} />;
}
```

### useCallback

```typescript
import { useCallback } from 'react';

function OrdersList({ onOrderPress }) {
  // Мемоизация функций
  const handlePress = useCallback((orderId) => {
    onOrderPress(orderId);
  }, [onOrderPress]);

  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => (
        <OrderCard order={item} onPress={() => handlePress(item.id)} />
      )}
    />
  );
}
```

## Redux Optimization

### Reselect для мемоизации селекторов

```bash
npm install reselect
```

```typescript
import { createSelector } from 'reselect';

// Базовые селекторы
const selectOrders = state => state.orders.list;
const selectFilter = state => state.orders.filter;

// Мемоизированный селектор
export const selectFilteredOrders = createSelector(
  [selectOrders, selectFilter],
  (orders, filter) => {
    return orders.filter(order => order.status === filter);
  }
);

// Использование
const filteredOrders = useSelector(selectFilteredOrders);
```

### Redux Toolkit Query для кэширования

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (page) => `/orders?page=${page}`,
      // Автоматическое кэширование
      keepUnusedDataFor: 60, // 60 секунд
    }),
  }),
});
```

## Navigation Optimization

### Lazy loading экранов

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

// Lazy load экранов
const OrdersScreen = React.lazy(() => import('./screens/OrdersScreen'));

function Navigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{
          // Предзагрузка экрана
          lazy: false,
        }}
      />
    </Stack.Navigator>
  );
}
```

### Оптимизация переходов

```typescript
<Stack.Navigator
  screenOptions={{
    // Отключить анимации для быстрых переходов
    animation: 'none',
    // Или использовать простые анимации
    animation: 'fade',
  }}
>
  {/* screens */}
</Stack.Navigator>
```

## Bundle Size Optimization

### Анализ размера bundle

```bash
# Установка
npm install --save-dev react-native-bundle-visualizer

# Анализ
npx react-native-bundle-visualizer
```

### Code splitting

```typescript
// Разделение на chunks
const HeavyComponent = React.lazy(() => 
  import(/* webpackChunkName: "heavy" */ './HeavyComponent')
);
```

## Performance Monitoring

### React Native Performance Monitor

```typescript
import { PerformanceMonitor } from './utils/performance';

const perfMonitor = new PerformanceMonitor();

// Измерение времени
perfMonitor.start('api-call');
await fetchData();
const duration = perfMonitor.end('api-call');

// Async измерение
await perfMonitor.measureAsync('load-screen', async () => {
  await loadScreenData();
});
```

### Flipper для профилирования

```bash
# Установка Flipper
# https://fbflipper.com/

# Плагины для мониторинга:
# - React DevTools
# - Network
# - Databases
# - Images
# - Crash Reporter
```

## Memory Management

### Очистка при unmount

```typescript
useEffect(() => {
  const subscription = eventEmitter.addListener('event', handler);

  return () => {
    // Очистка
    subscription.remove();
  };
}, []);
```

### Избегайте утечек памяти

```typescript
// ❌ Плохо - утечка памяти
useEffect(() => {
  setTimeout(() => {
    setState(newValue); // Может вызваться после unmount
  }, 1000);
}, []);

// ✅ Хорошо - проверка mounted
useEffect(() => {
  let mounted = true;

  setTimeout(() => {
    if (mounted) {
      setState(newValue);
    }
  }, 1000);

  return () => {
    mounted = false;
  };
}, []);
```

## Best Practices

### 1. Используйте PureComponent или memo

```typescript
// Для class components
class OrderCard extends React.PureComponent {
  render() {
    return <View>{/* ... */}</View>;
  }
}

// Для functional components
const OrderCard = React.memo(({ order }) => {
  return <View>{/* ... */}</View>;
});
```

### 2. Избегайте inline функций в render

```typescript
// ❌ Плохо - создается новая функция каждый render
<Button onPress={() => handlePress(item.id)} />

// ✅ Хорошо - мемоизированная функция
const handlePress = useCallback(() => {
  handlePress(item.id);
}, [item.id]);

<Button onPress={handlePress} />
```

### 3. Оптимизируйте re-renders

```typescript
// Используйте React DevTools Profiler
// Найдите компоненты с частыми re-renders
// Оптимизируйте через memo, useMemo, useCallback
```

### 4. Используйте правильные key в списках

```typescript
// ❌ Плохо - index как key
{items.map((item, index) => <Item key={index} />)}

// ✅ Хорошо - уникальный id
{items.map(item => <Item key={item.id} />)}
```

### 5. Оптимизируйте изображения

```typescript
// Используйте правильный формат
// Сжимайте изображения
// Используйте CDN
// Кэшируйте локально
```

## Checklist оптимизации

- [ ] Debouncing для поиска реализован
- [ ] Lazy loading для тяжелых компонентов
- [ ] Image optimization настроена
- [ ] Infinite scroll для списков
- [ ] FlatList оптимизирован
- [ ] Мемоизация (memo, useMemo, useCallback)
- [ ] Redux селекторы мемоизированы
- [ ] Navigation оптимизирована
- [ ] Bundle size проанализирован
- [ ] Memory leaks устранены
- [ ] Performance monitoring настроен

## Инструменты

- **Flipper** - отладка и профилирование
- **React DevTools** - анализ компонентов
- **Bundle Visualizer** - анализ размера
- **Why Did You Render** - отладка re-renders
- **Reactotron** - мониторинг Redux и API

## Дополнительные ресурсы

- [React Native Performance](https://reactnative.dev/docs/performance)
- [React Optimization](https://react.dev/learn/render-and-commit)
- [Expo Performance](https://docs.expo.dev/guides/performance/)
