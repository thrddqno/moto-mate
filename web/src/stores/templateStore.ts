import { create } from 'zustand'
import api from '../services/api'
import type { ApiResponse, CursorPageResponse, MaintenanceCategory, MaintenanceTemplate } from '../types'

interface TemplateStore {
  templates: MaintenanceTemplate[]
  loading: boolean
  error: string | null
  nextCursor: string | null
  hasMore: boolean
  fetchTemplates: (category?: MaintenanceCategory) => Promise<void>
  loadMoreTemplates: (category?: MaintenanceCategory) => Promise<void>
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [],
  loading: false,
  error: null,
  nextCursor: null,
  hasMore: false,

  fetchTemplates: async (category) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get<ApiResponse<CursorPageResponse<MaintenanceTemplate>>>('/templates', {
        params: category ? { category } : undefined,
      })
      if (res.data.success && res.data.data) {
        set({
          templates: res.data.data.content,
          nextCursor: res.data.data.nextCursor,
          hasMore: res.data.data.hasMore,
          loading: false,
        })
      } else {
        set({ loading: false, error: res.data.message })
      }
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load templates' })
    }
  },

  loadMoreTemplates: async (category) => {
    const state = useTemplateStore.getState()
    if (!state.hasMore || !state.nextCursor || state.loading) return
    set({ loading: true, error: null })
    try {
      const res = await api.get<ApiResponse<CursorPageResponse<MaintenanceTemplate>>>('/templates', {
        params: { ...(category ? { category } : {}), cursor: state.nextCursor },
      })
      if (res.data.success && res.data.data) {
        set((current) => ({
          templates: [...current.templates, ...res.data.data!.content],
          nextCursor: res.data.data!.nextCursor,
          hasMore: res.data.data!.hasMore,
          loading: false,
        }))
      } else {
        set({ loading: false, error: res.data.message })
      }
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load templates' })
    }
  },
}))
