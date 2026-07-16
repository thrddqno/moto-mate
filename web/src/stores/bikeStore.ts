import { create } from 'zustand'
import api from '../services/api'
import { useDashboardStore } from './dashboardStore'
import type {
  ApiResponse,
  CreateMotorcycleRequest,
  Motorcycle,
  MotorcycleDetail,
  UpdateMotorcycleRequest,
} from '../types'

interface BikeStore {
  bikes: Motorcycle[]
  loading: boolean
  error: string | null
  fetchBikes: () => Promise<void>
  createBike: (data: CreateMotorcycleRequest) => Promise<Motorcycle | null>
  updateBike: (id: string, data: UpdateMotorcycleRequest) => Promise<Motorcycle | null>
  deleteBike: (id: string) => Promise<void>
  getBikeDetail: (id: string) => Promise<MotorcycleDetail | null>
}

export const useBikeStore = create<BikeStore>((set) => ({
  bikes: [],
  loading: false,
  error: null,

  fetchBikes: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get<ApiResponse<Motorcycle[]>>('/motorcycles')
      if (res.data.success && res.data.data) {
        set({ bikes: res.data.data, loading: false })
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
