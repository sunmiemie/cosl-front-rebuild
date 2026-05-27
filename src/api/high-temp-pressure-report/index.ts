import { request } from "@/utils/service"

export type HighTempPressureReportResult = "pass" | "fail" | "pending"

export interface HighTempPressureInstrumentResult {
  order_id?: number
  order_no?: string
  instrument_id?: number | string
  instrument_name: string
  instrument_sn: string
  result: HighTempPressureReportResult
  result_text?: string
  observation?: string
  metrics?: Record<string, any>
  attachments?: Array<Record<string, any>>
}

export interface HighTempPressureReportListItem {
  id: number
  report_no: string
  task_number: string
  test_date: string
  tester: string
  status: number
  status_text: string
  overall_result?: HighTempPressureReportResult
  order_ids?: number[]
  order_numbers?: string[]
  instrument_results?: HighTempPressureInstrumentResult[]
  report_json?: Record<string, any>
  attachments?: Array<Record<string, any>>
  client_submit_id?: string
  reviewer_id?: number | null
  submit_time: string
  audit_time: string
  remark: string
}

export interface HighTempPressureReportPayload {
  report_no?: string
  task_number?: string
  test_date?: string
  tester?: string
  status?: number
  overall_result?: HighTempPressureReportResult
  order_ids?: number[]
  order_numbers?: string[]
  instrument_results?: HighTempPressureInstrumentResult[]
  report_json?: Record<string, any>
  attachments?: Array<Record<string, any>>
  client_submit_id?: string
  reviewer_id?: number | null
  audit_time?: string
  remark?: string
}

interface HighTempPressureReportMutationResponse {
  code: number
  msg?: string
  data?: HighTempPressureReportListItem
}

export function getHighTempPressureReportListApi(params: {
  page: number
  pageSize: number
  taskNumber?: string
  tester?: string
  status?: number | string
}) {
  return request<{
    code: number
    data: {
      list: HighTempPressureReportListItem[]
      total: number
      page: number
      pageSize: number
    }
  }>({
    url: "test/high-temp-pressure/report/list/",
    method: "get",
    params
  })
}

export function createHighTempPressureReportApi(data: HighTempPressureReportPayload) {
  return request<HighTempPressureReportMutationResponse>({
    url: "test/high-temp-pressure/report/create/",
    method: "post",
    data
  })
}

export function getHighTempPressureReportDetailApi(pk: number) {
  return request<{
    code: number
    data: HighTempPressureReportListItem
  }>({
    url: `test/high-temp-pressure/report/detail/${pk}/`,
    method: "get"
  })
}

export function updateHighTempPressureReportApi(pk: number, data: HighTempPressureReportPayload) {
  return request<HighTempPressureReportMutationResponse>({
    url: `test/high-temp-pressure/report/detail/${pk}/`,
    method: "put",
    data
  })
}

export function deleteHighTempPressureReportApi(pk: number) {
  return request<HighTempPressureReportMutationResponse>({
    url: `test/high-temp-pressure/report/detail/${pk}/`,
    method: "delete"
  })
}
