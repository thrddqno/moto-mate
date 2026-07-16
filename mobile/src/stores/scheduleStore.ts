import { create } from 'zustand';
import api from '../services/api';
import type {
  ApiResponse,
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '../types';

interface ScheduleStore {
  scheduleMap: Record<string, Schedule[]>;
  loading: boolean;
  error: string | null;
  fetchSchedules: (motorcycleId: string) => Promise<void>;
  createSchedule: (motorcycleId: string, data: CreateScheduleRequest) => Promise<Schedule | null>;
  updateSchedule: (motorcycleId: string, scheduleId: string, data: UpdateScheduleRequest) => Promise<Schedule | null>;
  deleteSchedule: (motorcycleId: string, scheduleId: string) => Promise<void>;
  invalidate: (motorcycleId: string) => void;
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
  scheduleMap: {},
  loading: false,
  error: null,

  fetchSchedules: async (motorcycleId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<ApiResponse<Schedule[]>>(
        `/motorcycles/${motorcycleId}/schedules`,
      );
      if (res.data.success && res.data.data) {
        set((state) => ({
          scheduleMap: { ...state.scheduleMap, [motorcycleId]: res.data.data! },
          loading: false,
        }));
      } else {
        set({ loading: false, error: res.data.message });
      }
    } catch (err: any) {
      set({ loading: false, error: err?.message || 'Failed to load schedules' });
    }
  },

  createSchedule: async (motorcycleId, data) => {
    try {
      const res = await api.post<ApiResponse<Schedule>>(
        `/motorcycles/${motorcycleId}/schedules`,
        data,
      );
      if (res.data.success && res.data.data) {
        const s = res.data.data;
        set((state) => ({
          scheduleMap: {
            ...state.scheduleMap,
            [motorcycleId]: [...(state.scheduleMap[motorcycleId] || []), s],
          },
        }));
        return s;
      }
      return null;
    } catch {
      return null;
    }
  },

  updateSchedule: async (motorcycleId, scheduleId, data) => {
    try {
      const res = await api.put<ApiResponse<Schedule>>(
        `/motorcycles/${motorcycleId}/schedules/${scheduleId}`,
        data,
      );
      if (res.data.success && res.data.data) {
        const updated = res.data.data;
        set((state) => ({
          scheduleMap: {
            ...state.scheduleMap,
            [motorcycleId]: (state.scheduleMap[motorcycleId] || []).map((s) =>
              s.id === scheduleId ? updated : s,
            ),
          },
        }));
        return updated;
      }
      return null;
    } catch {
      return null;
    }
  },

  deleteSchedule: async (motorcycleId, scheduleId) => {
    try {
      await api.delete(`/motorcycles/${motorcycleId}/schedules/${scheduleId}`);
      set((state) => ({
        scheduleMap: {
          ...state.scheduleMap,
          [motorcycleId]: (state.scheduleMap[motorcycleId] || []).filter(
            (s) => s.id !== scheduleId,
          ),
        },
      }));
    } catch {
      // silent
    }
  },

  invalidate: (motorcycleId) => {
    set((state) => {
      const map = { ...state.scheduleMap };
      delete map[motorcycleId];
      return { scheduleMap: map };
    });
  },
}));
