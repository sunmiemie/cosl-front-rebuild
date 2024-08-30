export interface GetWorkTimeData {
  date: string
  seconds: number
  times: {
    h: number
    m: number
    s: number
  }
  timeStr: string
}

export type GetWorkTimeResponseData = ApiResponseData<{
  list: GetWorkTimeData[]
}>
