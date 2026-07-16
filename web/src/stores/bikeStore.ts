import { create } from 'zustand'
import api from '../services/api'
import { useDashboardStore } from './dashboardStore'
import type {
  ApiResponse,
  CreateMotorcycleRequest,
  CursorPageResponse,
  Motorcycle,
  MotorcycleDetail,
  UpdateMotorcycleRequest,
} from '../types'

interface BikeStore {
  bikes: Motorcycle[]
  loading: boolean
  error: string | null
  nextCursor: string | null
  hasMore: boolean
  fetchBikes: () => Promise<void>
  loadMoreBikes: () => Promise<void>
  createBike: (data: CreateMotorcycleRequest) => Promise<Motorcycle | null>
  updateBike: (id: string, data: UpdateMotorcycleRequest) => Promise<Motorcycle | null>
  deleteBike: (id: string) => Promise<void>
  getBikeDetail: (id: string) => Promise<MotorcycleDetail | null>
}

export const useBikeStore = create<BikeStore>((set) => ({
  bikes: [],
  loading: false,
  error: null,
  nextCursor: null,
  hasMore: false,

  fetchBikes: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get<ApiResponse<CursorPageResponse<Motorcycle>>>('/motorcycles')
      if (res.data.success && res.data.data) {
        set({
          bikes: res.data.data.content,
          nextCursor: res.data.data.nextCursor,
          hasMore: res.data.data.hasMore,
          loading: false,
        })
      } else {
        set({ loading: false, error: res.data.message })
      }
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load bikes' })
    }
  },

  loadMoreBikes: async () => {
    const state = useBikeStore.getState()
    if (!state.hasMore || !state.nextCursor || state.loading) return
    set({ loading: true, error: null })
    try {
      const res = await api.get<ApiResponse<CursorPageResponse<Motorcycle>>>('/motorcycles', {
        params: { cursor: state.nextCursor },
      })
      if (res.data.success && res.data.data) {
        set((current) => ({
          bikes: [...current.bikes, ...res.data.data!.content],
          nextCursor: res.data.data!.nextCursor,
          hasMore: res.data.data!.hasMore,
          loading: false,
        }))
      } else {
        set({ loading: false, error: res.data.message })
      }
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load bikes' })
    }
  },

  createBike: async (data) => {
    const res = await api.post<ApiResponse<Motorcycle>>('/motorcycles', data)
    if (res.data.success && res.data.data) {
      set((state) => ({ bikes: [res.data.data!, ...state.bikes] }))
      useDashboardStore.getState().invalidate()
      return res.data.data
    }
    return null
  },

  updateBike: async (id, data) => {
    const res = await api.put<ApiResponse<Motorcycle>>(`/motorcycles/${id}`, data)
    if (res.data.success && res.data.data) {
      set((state) => ({
        bikes: state.bikes.map((bike) => (bike.id === id ? res.data.data! : bike)),
      }))
      useDashboardStore.getState().invalidate()
      return res.data.data
    }
    return null
  },

  deleteBike: async (id) => {
    await api.delete(`/motorcycles/${id}`)
    set((state) => ({ bikes: state.bikes.filter((bike) => bike.id !== id) }))
    useDashboardStore.getState().invalidate()
  },

  getBikeDetail: async (id) => {
    const res = await api.get<ApiResponse<MotorcycleDetail>>(`/motorcycles/${id}/detail`)
    if (res.data.success && res.data.data) return res.data.data
    return null
  },
}))
