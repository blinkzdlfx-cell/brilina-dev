import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(fetchFn: () => Promise<T>, deps: unknown[] = []): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function load() {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const data = await fetchFn();
        if (!cancelled && mountedRef.current) {
          setState({ data, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled && mountedRef.current) {
          const message = err instanceof Error ? err.message : 'An unknown error occurred';
          setState({ data: null, loading: false, error: message });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, deps);

  const refetch = useCallback(() => {
    setState({ data: null, loading: true, error: null });
    fetchFn()
      .then(data => setState({ data, loading: false, error: null }))
      .catch(err => {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setState({ data: null, loading: false, error: message });
      });
  }, [fetchFn]);

  return { ...state, refetch };
}

interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useMutation<T, Args extends unknown[]>(mutateFn: (...args: Args) => Promise<T>): {
  mutate: (...args: Args) => Promise<T | undefined>;
  data: T | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
} {
  const [state, setState] = useState<UseMutationState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const mutate = useCallback(async (...args: Args): Promise<T | undefined> => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await mutateFn(...args);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setState({ data: null, loading: false, error: message });
      return undefined;
    }
  }, [mutateFn]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { mutate, ...state, reset };
}
