import { request } from "@/utils/service"
import type * as T from "./types"

type MutationResponse = {
  code: number
  msg?: string
  data?: any
}

export function getSimulatedWellReportTemplateListApi(params: T.SimulatedWellReportTemplateListRequest) {
  return request<T.SimulatedWellReportTemplateListResponse>({
    url: "data/simulated-well-report-template/list",
    method: "get",
    params
  })
}

export function getSimulatedWellReportTemplateDetailApi(id: number) {
  return request<T.SimulatedWellReportTemplateDetailResponse>({
    url: `data/simulated-well-report-template/detail/${id}/`,
    method: "get"
  })
}

export function createSimulatedWellReportTemplateApi(data: T.CreateSimulatedWellReportTemplateRequest) {
  return request<MutationResponse>({
    url: "data/simulated-well-report-template/create",
    method: "post",
    data
  })
}

export function parseSimulatedWellReportTemplateDocxApi(data: FormData) {
  return request<T.ParseSimulatedWellReportTemplateDocxResponse>({
    url: "data/simulated-well-report-template/parse-docx",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}

export function updateSimulatedWellReportTemplateApi(id: number, data: T.UpdateSimulatedWellReportTemplateRequest) {
  return request<MutationResponse>({
    url: `data/simulated-well-report-template/update/${id}/`,
    method: "post",
    data
  })
}

export function deleteSimulatedWellReportTemplateApi(id: number) {
  return request<MutationResponse>({
    url: `data/simulated-well-report-template/delete/${id}/`,
    method: "delete"
  })
}
