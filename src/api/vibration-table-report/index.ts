import { request } from "@/utils/service"
import type { AssistantReportSyncFeedback } from "@/api/engineer-assistant/types"

export type VibrationTableReportResult = "pass" | "fail" | "pending"

export interface VibrationTableInstrumentResult {
  order_id?: number
  order_no?: string
  instrument_id?: number | string
  instrument_name: string
  instrument_sn: string
  result: VibrationTableReportResult
  result_text?: string
  observation?: string
  metrics?: Record<string, any>
  attachments?: Array<Record<string, any>>
}

export interface VibrationTableReportListItem {
  id: number
  report_no: string
  task_number: string
  instrument_sn?: string
  equipmentId?: string
  test_date: string
  tester: string
  status: number
  status_text: string
  overall_result?: VibrationTableReportResult
  order_ids?: number[]
  order_numbers?: string[]
  instrument_results?: VibrationTableInstrumentResult[]
  report_json?: Record<string, any>
  attachments?: Array<Record<string, any>>
  client_submit_id?: string
  reviewer_id?: number | null
  submit_time: string
  audit_time: string
  remark: string
  assistant_sync_status?: "pending" | "syncing" | "success" | "failed" | "skipped" | ""
  assistant_synced_at?: string | null
  assistant_sync_error?: string
  assistant_sync_retry_count?: number
}

export interface VibrationTableReportPayload {
  report_no?: string
  task_number?: string
  instrument_sn?: string
  test_date?: string
  tester?: string
  status?: number
  overall_result?: VibrationTableReportResult
  order_ids?: number[]
  order_numbers?: string[]
  instrument_results?: VibrationTableInstrumentResult[]
  report_json?: Record<string, any>
  attachments?: Array<Record<string, any>>
  client_submit_id?: string
  reviewer_id?: number | null
  audit_time?: string
  remark?: string
}

interface VibrationTableReportMutationResponse {
  code: number
  msg?: string
  data?: VibrationTableReportListItem & {
    assistantSync?: AssistantReportSyncFeedback
  }
}

export function getVibrationTableReportListApi(params: {
  page: number
  pageSize: number
  taskNumber?: string
  tester?: string
  status?: number | string
}) {
  return request<{
    code: number
    data: {
      list: VibrationTableReportListItem[]
      total: number
      page: number
      pageSize: number
    }
  }>({
    url: "test/vibration-table/report/list/",
    method: "get",
    params
  })
}

export function createVibrationTableReportApi(data: VibrationTableReportPayload) {
  return request<VibrationTableReportMutationResponse>({
    url: "test/vibration-table/report/create/",
    method: "post",
    data
  })
}

export function getVibrationTableReportDetailApi(pk: number) {
  return request<{
    code: number
    data: VibrationTableReportListItem
  }>({
    url: `test/vibration-table/report/detail/${pk}/`,
    method: "get"
  })
}

export function updateVibrationTableReportApi(pk: number, data: VibrationTableReportPayload) {
  return request<VibrationTableReportMutationResponse>({
    url: `test/vibration-table/report/detail/${pk}/`,
    method: "put",
    data
  })
}

export function deleteVibrationTableReportApi(pk: number) {
  return request<VibrationTableReportMutationResponse>({
    url: `test/vibration-table/report/detail/${pk}/`,
    method: "delete"
  })
}

export function getVibrationTableReportPdfApi(pk: number) {
  return request<Blob>({
    url: `test/vibration-table/report/pdf/${pk}/`,
    method: "get",
    responseType: "blob"
  })
}
