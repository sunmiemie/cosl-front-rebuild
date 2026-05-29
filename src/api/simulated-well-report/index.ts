import { request } from "@/utils/service"

export interface SimulatedWellReportListItem {
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
  reviewer_id?: number | null
  report_json?: Record<string, any>
  attachments?: Array<Record<string, any>>
  order_ids?: number[]
  order_numbers?: string[]
  client_submit_id?: string | null
}

export interface SimulatedWellReportPayload {
  report_no?: string
  task_number?: string
  test_date?: string
  tester?: string
  status?: number
  remark?: string
  report_json?: Record<string, any>
  attachments?: Array<Record<string, any>>
  order_ids?: number[]
  order_numbers?: string[]
  client_submit_id?: string | null
}

interface SimulatedWellReportMutationResponse {
  code: number
  msg?: string
}

export function getSimulatedWellReportListApi(params: {
  page: number
  pageSize: number
  taskNumber?: string
  tester?: string
  status?: number | string
}) {
  return request<{
    code: number
    data: {
      list: SimulatedWellReportListItem[]
      total: number
      page: number
      pageSize: number
    }
  }>({
    url: "test/simulated-well/report/list/",
    method: "get",
    params
  })
}

export function createSimulatedWellReportApi(data: SimulatedWellReportPayload) {
  return request<SimulatedWellReportMutationResponse>({
    url: "test/simulated-well/report/create/",
    method: "post",
    data
  })
}

export function getSimulatedWellReportDetailApi(pk: number) {
  return request<{
    code: number
    data: SimulatedWellReportListItem
  }>({
    url: `test/simulated-well/report/detail/${pk}/`,
    method: "get"
  })
}

export function updateSimulatedWellReportApi(pk: number, data: SimulatedWellReportPayload) {
  return request<SimulatedWellReportMutationResponse>({
    url: `test/simulated-well/report/detail/${pk}/`,
    method: "put",
    data
  })
}

export function deleteSimulatedWellReportApi(pk: number) {
  return request<SimulatedWellReportMutationResponse>({
    url: `test/simulated-well/report/detail/${pk}/`,
    method: "delete"
  })
}
