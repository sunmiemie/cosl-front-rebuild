import { request } from "@/utils/service"

export interface WaterCycleReportListItem {
  id: number
  report_no: string
  task_number: string
  test_date: string
  tester: string
  status: number
  status_text: string
  submit_time: string
  audit_time: string
  remark: string
}

export interface WaterCycleReportPayload {
  report_no: string
  task_number: string
  test_date: string
  tester: string
  status: number
  remark: string
}

export type WaterCycleReportUpdatePayload = Partial<WaterCycleReportPayload> & {
  audit_time?: string
}

interface WaterCycleReportMutationResponse {
  code: number
  msg?: string
}

export function getWaterCycleReportListApi(params: {
  page: number
  pageSize: number
  taskNumber?: string
  tester?: string
  status?: number | string
}) {
  return request<{
    code: number
    data: {
      list: WaterCycleReportListItem[]
      total: number
      page: number
      pageSize: number
    }
  }>({
    url: "test/water-cycle/report/list/",
    method: "get",
    params
  })
}

export function createWaterCycleReportApi(data: WaterCycleReportPayload) {
  return request<WaterCycleReportMutationResponse>({
    url: "test/water-cycle/report/create/",
    method: "post",
    data
  })
}

export function getWaterCycleReportDetailApi(pk: number) {
  return request<{
    code: number
    data: WaterCycleReportListItem
  }>({
    url: `test/water-cycle/report/detail/${pk}/`,
    method: "get"
  })
}

export function updateWaterCycleReportApi(pk: number, data: WaterCycleReportUpdatePayload) {
  return request<WaterCycleReportMutationResponse>({
    url: `test/water-cycle/report/detail/${pk}/`,
    method: "put",
    data
  })
}

export function deleteWaterCycleReportApi(pk: number) {
  return request<WaterCycleReportMutationResponse>({
    url: `test/water-cycle/report/detail/${pk}/`,
    method: "delete"
  })
}
