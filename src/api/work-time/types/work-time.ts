export interface GetWorkTimeData {
  date: string
  work_time: string
}

export type GetWorkTimeResponseData = ApiResponseData<GetWorkTimeData[]>
