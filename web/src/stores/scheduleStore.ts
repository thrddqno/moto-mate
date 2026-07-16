import { create } from 'zustand'
import api from '../services/api'
import { useDashboardStore } from './dashboardStore'
import type { ApiResponse, CreateScheduleRequest, Schedule, UpdateScheduleRequest } from '../types'

interface ScheduleStore {
  scheduleMap: Record<string, Schedule[]>
  loading: boolean
  error: string | null
  fetchSchedules: (motorcycleId: string) => Promise<void>
  createSchedule: (motorcycleId: string, data: CreateScheduleRequest) => Promise<Schedule | null>
  updateSchedule: (motorcycleId: string, scheduleId: string, data: UpdateScheduleRequest) => Promise<Schedule | null>
  deleteSchedule: (motorcycleId: string, scheduleId: string) => Promise<void>
}

function invalidateDashboard() {
  useDashboardStore.getState().invalidate()
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
  scheduleMap: {},
  loading: false,
  error: null,

  fetchSchedules: async (motorcycleId) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get<ApiResponse<Schedule[]>>(`/motorcycles/${motorcycleId}/schedules`)
      if (res.data.success && res.data.data) {
        set((state) => ({
          scheduleMap: { ...state.scheduleMap, [motorcycleId]: res.data.data! },
          loading: false,
        }))
      } else {
        set({ loading: false, error: res.data.message })
      }
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load schedules' })
    }
  },

  createSchedule: async (motorcycleId, data) => {
    const res = await api.post<ApiResponse<Schedule>>(`/motorcycles/${motorcycleId}/schedules`, data)
    if (res.data.success && res.data.data) {
      const schedule = res.data.data
      set((state) => ({
        scheduleMap: {
          ...state.scheduleMap,
          [motorcycleId]: [...(state.scheduleMap[motorcycleId] || []), schedule],
        },
      }))
      invalidateDashboard()
      return schedule
    }
    return null
  },

  updateSchedule: async (motorcycleId, scheduleId, data) => {
    const res = await api.put<ApiResponse<Schedule>>(`/motorcycles/${motorcycleId}/schedules/${scheduleId}`, data)
    if (res.data.success && res.data.data) {
      const updated = res.data.data
      set((state) => ({
        scheduleMap: {
          ...state.scheduleMap,
          [motorcycleId]: (state.scheduleMap[motorcycleId] || []).map((schedule) =>
            schedule.id === scheduleId ? updated : schedule,
          ),
        },
      }))
      invalidateDashboard()
      return updated
    }
    return null
  },

  deleteSchedule: async (motorcycleId, scheduleId) => {
    await api.delete(`/motorcycles/${motorcycleId}/schedules/${scheduleId}`)
    set((state) => ({
      scheduleMap: {
        ...state.scheduleMap,
        [motorcycleId]: (state.scheduleMap[motorcycleId] || []).filter((schedule) => schedule.id !== scheduleId),
      },
    }))
    invalidateDashboard()
  },
}))
