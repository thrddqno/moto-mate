import { create } from 'zustand';
import api from '../services/api';
import { useDashboardStore } from './dashboardStore';
import type {
  ApiResponse,
  Motorcycle,
  MotorcycleDetail,
  CreateMotorcycleRequest,
  UpdateMotorcycleRequest,
} from '../types';

interface BikeStore {
  bikes: Motorcycle[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchBikes: () => Promise<void>;
  createBike: (data: CreateMotorcycleRequest) => Promise<Motorcycle | null>;
  updateBike: (id: string, data: UpdateMotorcycleRequest) => Promise<Motorcycle | null>;
  deleteBike: (id: string) => Promise<void>;
  getBikeDetail: (id: string) => Promise<MotorcycleDetail | null>;
  invalidate: () => void;
  refreshDashboard: () => void;
}

export const useBikeStore = create<BikeStore>((set, get) => ({
  bikes: [],
  loading: false,
  error: null,
  lastFetched: null,

  fetchBikes: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<ApiResponse<Motorcycle[]>>('/motorcycles');
      if (res.data.success && res.data.data) {
        set({ bikes: res.data.data, loading: false, lastFetched: Date.now() });
      } else {
        set({ loading: false, error: res.data.message });
      }
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to load bikes' });
    }
  },

  refreshDashboard: () => {
    const dash = useDashboardStore.getState();
    dash.invalidate();
    dash.fetchDashboard();
  },

  createBike: async (data) => {
    try {
      const res = await api.post<ApiResponse<Motorcycle>>('/motorcycles', data);
      if (res.data.success && res.data.data) {
        set((state) => ({ bikes: [res.data.data!, ...state.bikes] }));
        get().refreshDashboard();
        return res.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  updateBike: async (id, data) => {
    try {
      const res = await api.put<ApiResponse<Motorcycle>>(`/motorcycles/${id}`, data);
      if (res.data.success && res.data.data) {
        set((state) => ({
          bikes: state.bikes.map((b) => (b.id === id ? res.data.data! : b)),
        }));
        get().refreshDashboard();
        return res.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  deleteBike: async (id) => {
    try {
      await api.delete(`/motorcycles/${id}`);
      set((state) => ({ bikes: state.bikes.filter((b) => b.id !== id) }));
      get().refreshDashboard();
    } catch {
      // silent
    }
  },

  getBikeDetail: async (id) => {
    try {
      const res = await api.get<ApiResponse<MotorcycleDetail>>(`/motorcycles/${id}/detail`);
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  invalidate: () => set({ lastFetched: null }),
}));
