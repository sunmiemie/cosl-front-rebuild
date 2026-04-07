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

export interface ReportQueryData {
  id?: string | number | null
  name?: string | null
  type?: string | null
  user?: string | null
  date?: string | null
  [key: string]: string | number | null | undefined
}

export type GetSingleReportResponseData = ApiResponseData<ReportQueryData>
export type CheckReportResponseData = ApiResponseData<any>

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

export interface ReportActionResponseData {
  code: number
  message: string
  success?: boolean
  msg?: string
}
