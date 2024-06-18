import { request } from "@/utils/service"
import type * as TestType from "./types/report"

/** 查 */
export function getReportDataApi(params: {
  size: number
  currentPage: number
  id?: string
  user?: string
  type?: string
  date?: string
}) {
  return request<TestType.GetReportResponseData>({
    url: "data/report/list",
    method: "get",
    params
  })
}
