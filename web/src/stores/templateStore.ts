import { create } from 'zustand'
import api from '../services/api'
import type { ApiResponse, MaintenanceCategory, MaintenanceTemplate } from '../types'

interface TemplateStore {
  templates: MaintenanceTemplate[]
  loading: boolean
  error: string | null
  fetchTemplates: (category?: MaintenanceCategory) => Promise<void>
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [],
  loading: false,
  error: null,

  fetchTemplates: async (category) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get<ApiResponse<MaintenanceTemplate[]>>('/templates', {
        params: category ? { category } : undefined,
      })
      if (res.data.success && res.data.data) {
        set({ templates: res.data.data, loading: false })
      } else {
        set({ loading: false, error: res.data.message })
      }
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load templates' })
    }
  },
}))
