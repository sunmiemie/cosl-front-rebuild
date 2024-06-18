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
