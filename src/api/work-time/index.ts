import { request } from "@/utils/service"
import type * as WorkTime from "./types/work-time"

export function getWorkTimeDataApi(params: { userId?: number | string; currentPage: number; pageSize: number }) {
  return request<WorkTime.GetWorkTimeResponseData>({
    url: "data/work-time/list",
    method: "get",
    params
  })
}
