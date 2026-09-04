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
  monitor_csv_url?: string | null
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

export type SimulatedWellDepthCurvePoint = [timestampMs: number, depth: number | null]

export interface SimulatedWellCommunicationEvent {
  timestamp_ms: number
  depth: number
  device: string
  connected: 0 | 1 | null
  depth_carried: boolean
  device_states?: Array<{
    device: string
    connected: 0 | 1 | null
  }>
}

export interface SimulatedWellDepthCurveData {
  points: SimulatedWellDepthCurvePoint[]
  total: number
  sampled: boolean
  communication_events: SimulatedWellCommunicationEvent[]
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

/** 获取模拟井报告的时间-深度曲线数据 */
export function getSimulatedWellReportDepthCurveApi(pk: number) {
  return request<{
    code: number
    data: SimulatedWellDepthCurveData
  }>({
    url: `test/simulated-well/report/depth-curve/${pk}/`,
    method: "get",
    silentError: true
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

export function getSimulatedWellReportCurveDownloadTicketApi(pk: number) {
  return request<{
    code: number
    data: { url: string; expires_in: number }
  }>({
    url: `test/simulated-well/report/curve-download-ticket/${pk}/`,
    method: "post"
  })
}
