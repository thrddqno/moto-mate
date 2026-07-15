import React, { useState, useCallback } from 'react';
import api from '../services/api';
import { ApiResponse } from '../types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (request: () => Promise<{ data: ApiResponse<T> }>) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await request();
        const body = response.data;
        if (!body.success) {
          const msg = body.errors?.join(', ') || body.message || 'Unknown error';
          setState({ data: null, loading: false, error: msg });
          return null;
        }
        setState({ data: body.data, loading: false, error: null });
        return body.data;
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.errors?.join(', ') ||
          err.message ||
          'Network error';
        setState({ data: null, loading: false, error: msg });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

// Convenience hooks for specific endpoints

export function useMotorcycles() {
  return useApi<any[]>();
}

export function useDashboard() {
  return useApi<any>();
}
