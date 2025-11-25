import { useState, useCallback } from 'react';

/**
 * Hook для infinite scroll / pagination
 */
export function useInfiniteScroll<T>(
  fetchFunction: (page: number) => Promise<{ data: T[]; hasMore: boolean }>
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(page);
      
      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchFunction]);

  const refresh = useCallback(async () => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setLoading(true);

    try {
      const result = await fetchFunction(1);
      
      setData(result.data);
      setHasMore(result.hasMore);
      setPage(2);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}

/**
 * Пример использования:
 * 
 * function OrdersList() {
 *   const { data, loading, hasMore, loadMore, refresh } = useInfiniteScroll(
 *     async (page) => {
 *       const response = await apiService.get(`/orders?page=${page}`);
 *       return {
 *         data: response.data,
 *         hasMore: response.pagination.hasNext,
 *       };
 *     }
 *   );
 * 
 *   return (
 *     <FlatList
 *       data={data}
 *       renderItem={({ item }) => <OrderCard order={item} />}
 *       onEndReached={loadMore}
 *       onEndReachedThreshold={0.5}
 *       refreshing={loading}
 *       onRefresh={refresh}
 *       ListFooterComponent={
 *         loading ? <ActivityIndicator /> : null
 *       }
 *     />
 *   );
 * }
 */
