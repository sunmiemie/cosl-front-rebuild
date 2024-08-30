import { request } from "@/utils/service"
import type * as WorkTime from "@/api/work-time/types/work-time"

export function getWorkTimeDataApi(params: { userId: number }) {
  return request<WorkTime.GetWorkTimeResponseData>({
    url: "data/work-time/list",
    method: "get",
    params
  })
}
