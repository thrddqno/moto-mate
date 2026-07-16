import { create } from 'zustand';
import api from '../services/api';
import type { ApiResponse, DashboardResponse } from '../types';

interface DashboardStore {
  data: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchDashboard: () => Promise<void>;
  invalidate: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  data: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<ApiResponse<DashboardResponse>>('/dashboard');
      if (res.data.success && res.data.data) {
        set({ data: res.data.data, loading: false, lastFetched: Date.now() });
      } else {
        set({ loading: false, error: res.data.message });
      }
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to load dashboard' });
    }
  },

  invalidate: () => set({ lastFetched: null }),
}));
