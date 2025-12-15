import { useState, useEffect, useCallback, useRef } from 'react';

interface UseScheduledFetchOptions<T> {
  url: string;
  interval?: number; // in milliseconds
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseScheduledFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastFetched: Date | null;
}

export function useScheduledFetch<T>({
  url,
  interval = 60000, // Default: 1 minute
  enabled = true,
  onSuccess,
  onError,
}: UseScheduledFetchOptions<T>): UseScheduledFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = (await response.json()) as T;
      setData(result);
      setLastFetched(new Date());
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [url, enabled, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      void fetchData();
    }
  }, [enabled, fetchData]);

  // Scheduled fetch
  useEffect(() => {
    if (enabled && interval > 0) {
      intervalRef.current = setInterval(() => {
        void fetchData();
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastFetched,
  };
}
