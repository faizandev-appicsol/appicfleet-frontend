export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export type PageQuery = {
  page?: number
  pageSize?: number
  search?: string
}
