/** API request/response envelopes used by RTK Query and the MSW handlers. */

export interface PaginatedRequest {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  search?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  status: number
  message: string
  code?: string
}
