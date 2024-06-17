export interface CreateBatchRequestData {
  file: FormData
}

export interface UpdateBatchRequestData {
  id: string
  name: string
}

export interface GetBatchRequestData {
  currentPage: number
  size: number
  name?: string
  id?: string
  boardmodel?: string
  batchId?: string
  batchName?: string
  supplier?: string
}

export interface GetBatchData {
  id: string
  name: string
  boardmodel: string
  dateTime: string
}

export type GetBatchResponseData = ApiResponseData<{
  list: GetBatchData[]
  total: number
}>
