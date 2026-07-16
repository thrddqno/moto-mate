import { useState, useCallback } from 'react';
import api from '../services/api';
import type { ApiResponse, Motorcycle, CreateMotorcycleRequest, UpdateMotorcycleRequest } from '../types';

export function useBikes() {
  const [bikes, setBikes] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBikes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<Motorcycle[]>>('/motorcycles');
      if (res.data.success && res.data.data) {
        setBikes(res.data.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load bikes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBike = useCallback(async (data: CreateMotorcycleRequest) => {
    const res = await api.post<ApiResponse<Motorcycle>>('/motorcycles', data);
    if (res.data.success && res.data.data) {
      setBikes((prev) => [res.data.data!, ...prev]);
    }
    return res.data;
  }, []);

  const updateBike = useCallback(async (id: string, data: UpdateMotorcycleRequest) => {
    const res = await api.put<ApiResponse<Motorcycle>>(`/motorcycles/${id}`, data);
    if (res.data.success && res.data.data) {
      setBikes((prev) => prev.map((b) => (b.id === id ? res.data.data! : b)));
    }
    return res.data;
  }, []);

  const deleteBike = useCallback(async (id: string) => {
    await api.delete(`/motorcycles/${id}`);
    setBikes((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { bikes, loading, error, fetchBikes, createBike, updateBike, deleteBike };
}
