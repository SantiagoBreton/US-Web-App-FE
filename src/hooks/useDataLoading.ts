import { useState, useEffect, useCallback } from 'react';

interface UseDataLoadingOptions<T> {
  loadFn: (token: string) => Promise<T>;
  token: string;
  enabled?: boolean;
  onError?: (error: Error) => void;
  initialData?: T;
  dependencies?: any[];
}

export function useDataLoading<T>({
  loadFn,
  token,
  enabled = true,
  onError,
  initialData,
  dependencies = []
}: UseDataLoadingOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!enabled || !token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await loadFn(token);
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [loadFn, token, enabled, onError]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadData, ...dependencies]);

  const refetch = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refetch,
    setData
  };
}

export function useArrayDataLoading<T>({
  loadFn,
  token,
  enabled = true,
  onError,
  dependencies = []
}: Omit<UseDataLoadingOptions<T[]>, 'initialData'>) {
  const result = useDataLoading({
    loadFn,
    token,
    enabled,
    onError,
    initialData: [] as T[],
    dependencies
  });

  return {
    ...result,
    data: result.data || [] as T[]
  };
}