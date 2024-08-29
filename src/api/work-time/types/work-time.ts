export interface GetWorkTimeData {
  date: string
  seconds: number
}

export type GetWorkTimeResponseData = ApiResponseData<{
  list: GetWorkTimeData[]
}>
