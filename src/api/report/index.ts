import { request } from "@/utils/service"
import type * as TestType from "./types/report"

/** 查 */
export function getReportDataApi(params: {
  size: number
  serial: string | undefined
  id: string | undefined
  currentPage: number
  type: string | undefined
  user: string | undefined
}) {
  return request<TestType.GetReportResponseData>({
    url: "data/report/list",
    method: "get",
    params
  })
}

export function getReportCheckDataApi(params: {
  size: number
  serial: string | undefined
  id: string | undefined
  currentPage: number
  type: string | undefined
  user: string | undefined
}) {
  return request<TestType.GetReportResponseData>({
    url: "data/report/check/list",
    method: "get",
    params
  })
}
