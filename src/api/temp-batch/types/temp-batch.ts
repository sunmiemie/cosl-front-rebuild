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

export interface PreviewTempBatchResponseData {
  code: number
  message: string
  preview_temp_boards: unknown[]
  preview_dev_testunit: unknown[]
  batches_gen: unknown[]
  instrument_name: string
}

export interface NewestBatchNumberResponseData {
  code: number
  message: string
  batch_id: string
}
