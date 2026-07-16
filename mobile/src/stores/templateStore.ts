import { create } from 'zustand';
import api from '../services/api';
import type { ApiResponse, MaintenanceTemplate, MaintenanceCategory, CreateTemplateRequest } from '../types';

interface TemplateStore {
  templates: MaintenanceTemplate[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchTemplates: (category?: MaintenanceCategory) => Promise<void>;
  getByCategory: (category: MaintenanceCategory) => MaintenanceTemplate[];
  createTemplate: (data: CreateTemplateRequest) => Promise<MaintenanceTemplate | null>;
  invalidate: () => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  loading: false,
  error: null,
  lastFetched: null,

  fetchTemplates: async (category) => {
    set({ loading: true, error: null });
    try {
      const params = category ? { category } : undefined;
      const res = await api.get<ApiResponse<MaintenanceTemplate[]>>('/templates', { params });
      if (res.data.success && res.data.data) {
        set({ templates: res.data.data, loading: false, lastFetched: Date.now() });
      } else {
        set({ loading: false, error: res.data.message });
      }
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to load templates' });
    }
  },

  getByCategory: (category) => {
    return get().templates.filter((t) => t.category === category);
  },

  createTemplate: async (data) => {
    try {
      const res = await api.post<ApiResponse<MaintenanceTemplate>>('/templates', data);
      if (res.data.success && res.data.data) {
        set((state) => ({ templates: [...state.templates, res.data.data!] }));
        return res.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  invalidate: () => set({ lastFetched: null }),
}));
