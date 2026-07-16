import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../services/api';
import type { ApiResponse } from '../types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  url: string | null,
  options?: { immediate?: boolean },
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: options?.immediate !== false,
    error: null,
  });

  const fetch = useCallback(async () => {
    if (!url) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.get<ApiResponse<T>>(url);
      if (res.data.success && res.data.data) {
        setState({ data: res.data.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: res.data.message });
      }
    } catch (err: any) {
      setState({
        data: null,
        loading: false,
        error: err?.message || 'Request failed',
      });
    }
  }, [url]);

  useEffect(() => {
    if (options?.immediate !== false && url) {
      fetch();
    }
  }, [fetch, url, options?.immediate]);

  return { ...state, refetch: fetch };
}
