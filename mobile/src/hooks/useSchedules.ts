import { useState, useCallback } from 'react';
import api from '../services/api';
import type {
  ApiResponse,
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '../types';

export function useSchedules(motorcycleId: string | null) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    if (!motorcycleId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<Schedule[]>>(
        `/motorcycles/${motorcycleId}/schedules`,
      );
      if (res.data.success && res.data.data) {
        setSchedules(res.data.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, [motorcycleId]);

  const createSchedule = useCallback(
    async (data: CreateScheduleRequest) => {
      if (!motorcycleId) return;
      const res = await api.post<ApiResponse<Schedule>>(
        `/motorcycles/${motorcycleId}/schedules`,
        data,
      );
      if (res.data.success && res.data.data) {
        setSchedules((prev) => [...prev, res.data.data!]);
      }
      return res.data;
    },
    [motorcycleId],
  );

  const updateSchedule = useCallback(
    async (scheduleId: string, data: UpdateScheduleRequest) => {
      if (!motorcycleId) return;
      const res = await api.put<ApiResponse<Schedule>>(
        `/motorcycles/${motorcycleId}/schedules/${scheduleId}`,
        data,
      );
      if (res.data.success && res.data.data) {
        setSchedules((prev) =>
          prev.map((s) => (s.id === scheduleId ? res.data.data! : s)),
        );
      }
      return res.data;
    },
    [motorcycleId],
  );

  const deleteSchedule = useCallback(
    async (scheduleId: string) => {
      if (!motorcycleId) return;
      await api.delete(`/motorcycles/${motorcycleId}/schedules/${scheduleId}`);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    },
    [motorcycleId],
  );

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
