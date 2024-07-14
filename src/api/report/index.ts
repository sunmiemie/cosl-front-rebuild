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
export function getSingleReportDataApi(params: any) {
  return request<TestType.GetReportResponseData>({
    url: "data/report/single",
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

export const checkReportDataApi = (params: any) => {
  return request({
    url: "data/report/check/operate",
    method: "get",
    params
  })
}

export const checkReportPassApi = (data: any) => {
  return request({
    url: "data/report/check/pass",
    headers: { "Content-Type": "multipart/form-data" },
    method: "post",
    data
  })
}

export const checkReportFeedbackApi = (data: any) => {
  return request({
    url: "data/report/check/feedback",
    headers: { "Content-Type": "multipart/form-data" },
    method: "post",
    data
  })
}

export const generateQuestionUnitApi = (data: any) => {
  return request({
    url: "test/questionunit/add/",
    headers: { "Content-Type": "multipart/form-data" },
    method: "post",
    data
  })
}
