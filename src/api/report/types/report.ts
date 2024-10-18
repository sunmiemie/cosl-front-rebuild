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
}>