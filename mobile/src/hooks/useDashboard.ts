import { useState, useCallback } from 'react';
import api from '../services/api';
import type { ApiResponse, DashboardResponse } from '../types';

export function useDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<DashboardResponse>>('/dashboard');
      if (res.data.success && res.data.data) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refetch: fetchDashboard };
}
