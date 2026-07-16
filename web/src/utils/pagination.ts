import type { CursorPageResponse } from '../types'

export function normalizeCursorPage<T>(value: CursorPageResponse<T> | T[] | null | undefined): CursorPageResponse<T> {
  if (Array.isArray(value)) {
    return {
      content: value,
      nextCursor: null,
      hasMore: false,
      pageSize: value.length,
    }
  }

  return {
    content: Array.isArray(value?.content) ? value.content : [],
    nextCursor: value?.nextCursor ?? null,
    hasMore: Boolean(value?.hasMore),
    pageSize: value?.pageSize ?? 0,
  }
}
