import { request } from "@/utils/service"
import type { AssistantReportSyncFeedback } from "@/api/engineer-assistant/types"

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
  operator_user_id?: number | null
  operator_signature_url?: string | null
  report_json?: Record<string, any>
  attachments?: Array<Record<string, any>>
  order_ids?: number[]
  order_numbers?: string[]
  client_submit_id?: string | null
  instrument_sn?: string
  equipmentId?: string
  assistant_sync_status?: "pending" | "syncing" | "success" | "failed" | "skipped" | ""
  assistant_synced_at?: string | null
  assistant_sync_error?: string
  assistant_sync_retry_count?: number
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
  data?: SimulatedWellReportListItem & {
    assistantSync?: AssistantReportSyncFeedback
  }
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

export function getSimulatedWellReportPdfApi(pk: number) {
  return request<Blob>({
    url: `test/simulated-well/report/download/${pk}/`,
    method: "get",
    responseType: "blob"
  })
}

export function getSimulatedWellReportCurveZipApi(pk: number) {
  return request<Blob>({
    url: `test/simulated-well/report/curve-download/${pk}/`,
    method: "get",
    responseType: "blob"
  })
}
