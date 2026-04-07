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

export interface BoardBySerialData {
  batch_name: string
  batch_id: string | number
  board_model_name: string
  boardmodel_id: string | number
}

export type GetBoardDataBySnResponseData = ApiResponseData<any[]>

export type GetProdBoardDataBySnResponseData = ApiResponseData<BoardBySerialData>
