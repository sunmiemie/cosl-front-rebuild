export interface GetReportData {
  id: string
  name: string
  type: string
  boardId: string
  report_filepath: string
  status: string
  link?: any
}

export type GetReportResponseData = ApiResponseData<{
  list: GetReportData[]
  total: number
  currentPage: number
  pageSize: number
}>

export interface GetBugReportData {
  id: string
  name: string
  boardId: string
  report_filepath: string
  link?: any
}

export type GetBugReportResponseData = ApiResponseData<{
  list: GetBugReportData[]
  total: number
  currentPage: number
  pageSize: number
}>

export interface GetBatchReportData {
  id: string
  name: string
  report_filepath: string
  link?: any
}
export type GetBatchReportResponseData = ApiResponseData<{
  list: GetBatchReportData[]
  total: number
  currentPage: number
  pageSize: number
}>
