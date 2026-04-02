export interface GetWorkTimeData {
  date: string
  work_time: string
}

export type GetWorkTimeResponseData = ApiResponseData<{
  list: GetWorkTimeData[]
  total: number
}>
