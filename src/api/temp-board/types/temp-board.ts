export interface CreateTempBoardRequestData {
  serialNumber: string
  description: string
}

export interface GetTempBoardRequestData {
  currentPage?: number
  size?: number
  serialNumber?: string
  id?: string
}

export type GetTempBoardResponseData = ApiResponseData<{
  list: GetTempBoardData[]
  total: number
}>

export interface GetTempBoardData {
  model: any
  id: string
  seria: string
}
