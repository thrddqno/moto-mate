import { create } from 'zustand'
import api from '../services/api'
import { useDashboardStore } from './dashboardStore'
import { normalizeCursorPage } from '../utils/pagination'
import type { ApiResponse, CreateServiceLogRequest, CursorPageResponse, ServiceLog } from '../types'

interface ServiceLogStore {
  logs: ServiceLog[]
  loading: boolean
  error: string | null
  nextCursor: string | null
  hasMore: boolean
  fetchLogs: (motorcycleId?: string | null) => Promise<void>
  loadMoreLogs: (motorcycleId?: string | null) => Promise<void>
  createLog: (motorcycleId: string, data: CreateServiceLogRequest) => Promise<ServiceLog | null>
}

function historyPath(motorcycleId?: string | null) {
  return motorcycleId ? `/motorcycles/${motorcycleId}/logs` : '/service-logs'
}

export const useServiceLogStore = create<ServiceLogStore>((set) => ({
  logs: [],
  loading: false,
  error: null,
  nextCursor: null,
  hasMore: false,

  fetchLogs: async (motorcycleId) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get<ApiResponse<CursorPageResponse<ServiceLog> | ServiceLog[]>>(historyPath(motorcycleId))
      if (res.data.success && res.data.data) {
        const page = normalizeCursorPage(res.data.data)
        set({
          logs: page.content,
          nextCursor: page.nextCursor,
          hasMore: page.hasMore,
          loading: false,
        })
      } else {
        set({ loading: false, error: res.data.message })
      }
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load service logs' })
    }
  },

  loadMoreLogs: async (motorcycleId) => {
    const state = useServiceLogStore.getState()
    if (!state.hasMore || !state.nextCursor || state.loading) return
    set({ loading: true, error: null })
    try {
      const res = await api.get<ApiResponse<CursorPageResponse<ServiceLog> | ServiceLog[]>>(historyPath(motorcycleId), {
        params: { cursor: state.nextCursor },
      })
      if (res.data.success && res.data.data) {
        const page = normalizeCursorPage(res.data.data)
        set((current) => ({
          logs: [...(current.logs || []), ...page.content],
          nextCursor: page.nextCursor,
          hasMore: page.hasMore,
          loading: false,
        }))
      } else {
        set({ loading: false, error: res.data.message })
      }
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load service logs' })
    }
  },

  createLog: async (motorcycleId, data) => {
    const res = await api.post<ApiResponse<ServiceLog>>(`/motorcycles/${motorcycleId}/logs`, data)
    if (res.data.success && res.data.data) {
      set((state) => ({ logs: [res.data.data!, ...state.logs] }))
      useDashboardStore.getState().invalidate()
      return res.data.data
    }
    return null
  },
}))
