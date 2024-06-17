export interface CreateBoardRequestData {
  name: string
  model: string
  seria: string
}

export interface UpdateBoardRequestData {
  id: string
  name: string
  model: string
  seria: string
}

export interface GetBoardRequestData {
  currentPage: number
  size: number
  seria?: string
  batch?: string
}

export interface GetBoardData {
  model: any
  startTime: string
  done: string
  id: string
  seria: string
}

export type GetBoardResponseData = ApiResponseData<{
  list: GetBoardData[]
  total: number
}>
