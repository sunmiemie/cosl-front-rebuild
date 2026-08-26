import { request } from "@/utils/service"
import type { AssistantReportSyncFeedback } from "@/api/engineer-assistant/types"

export type AssistantReportSyncStatus = "pending" | "syncing" | "success" | "failed" | "skipped" | ""

export interface HighTempBoxReportListItem {
  id: number
  report_no: string
  task_number: string
  instrument_sn: string
  test_date: string
  tester: string
  status: number
  status_text: string
  submit_time: string
  audit_time: string
  remark: string
  assistant_sync_status?: AssistantReportSyncStatus
  assistant_synced_at?: string | null
  assistant_sync_error?: string
  assistant_sync_retry_count?: number
}

export interface HighTempBoxReportPayload {
  report_no: string
  task_number: string
  instrument_sn: string
  test_date: string
  tester: string
  status: number
  remark: string
}

export type HighTempBoxReportUpdatePayload = Partial<HighTempBoxReportPayload> & {
  audit_time?: string
}

interface HighTempBoxReportMutationResponse {
  code: number
  msg?: string
  data?: HighTempBoxReportListItem & {
    assistantSync?: AssistantReportSyncFeedback
  }
}

export function getHighTempBoxReportListApi(params: {
  page: number
  pageSize: number
  taskNumber?: string
  tester?: string
  status?: number | string
}) {
  return request<{
    code: number
    data: {
      list: HighTempBoxReportListItem[]
      total: number
      page: number
      pageSize: number
    }
  }>({
    url: "test/high-temp-box/report/list/",
    method: "get",
    params
  })
}

export function createHighTempBoxReportApi(data: HighTempBoxReportPayload) {
  return request<HighTempBoxReportMutationResponse>({
    url: "test/high-temp-box/report/create/",
    method: "post",
    data
  })
}

export function getHighTempBoxReportDetailApi(pk: number) {
  return request<{
    code: number
    data: HighTempBoxReportListItem
  }>({
    url: `test/high-temp-box/report/detail/${pk}/`,
    method: "get"
  })
}

export function updateHighTempBoxReportApi(pk: number, data: HighTempBoxReportUpdatePayload) {
  return request<HighTempBoxReportMutationResponse>({
    url: `test/high-temp-box/report/detail/${pk}/`,
    method: "put",
    data
  })
}

export function deleteHighTempBoxReportApi(pk: number) {
  return request<HighTempBoxReportMutationResponse>({
    url: `test/high-temp-box/report/detail/${pk}/`,
    method: "delete"
  })
}

export function getHighTempBoxReportPdfApi(pk: number) {
  return request<Blob>({
    url: `test/high-temp-box/report/pdf/${pk}/`,
    method: "get",
    responseType: "blob"
  })
}
