export interface GetTempBatchRequestData {
  currentPage: number
  size: number
  name?: string
  id?: string
  batchId?: string
  batchName?: string
  supplier?: string
}

export interface GetTempBatchData {
  id: string
  name: string
  dateTime: string
}

export type GetTempBatchResponseData = ApiResponseData<{
  list: GetTempBatchData[]
  total: number
}>
