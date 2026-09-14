import { request } from "@/utils/service"

export interface SensorlessOvenReportAttachment {
  field?: string
  type?: string
  name?: string
  file_name?: string
  file_url?: string
  size?: number
  content_type?: string
}

export interface SensorlessOvenReportListItem {
  id: number
  report_no: string
  task_number: string
  test_date: string
  tester: string
  status: number
  status_text: string
  submit_time: string
  audit_time: string | null
  reviewer_id: number | null
  remark: string
  report_json?: Record<string, any>
  attachments?: SensorlessOvenReportAttachment[]
  order_ids?: number[]
  order_numbers?: string[]
}

export type SensorlessOvenReportUpdatePayload = {
  status?: number
  audit_time?: string
  remark?: string
  reviewer_signature_id?: number
}

interface SensorlessOvenReportMutationResponse {
  code: number
  msg?: string
  data?: SensorlessOvenReportListItem
}

export function getSensorlessOvenReportListApi(params: {
  page: number
  pageSize: number
  taskNumber?: string
  tester?: string
  status?: number | string
}) {
  return request<{
    code: number
    data: {
      list: SensorlessOvenReportListItem[]
      total: number
      page: number
      pageSize: number
    }
  }>({
    url: "test/sensorless-oven/report/list/",
    method: "get",
    params
  })
}

export function getSensorlessOvenReportDetailApi(pk: number) {
  return request<{
    code: number
    data: SensorlessOvenReportListItem
  }>({
    url: `test/sensorless-oven/report/detail/${pk}/`,
    method: "get"
  })
}

export function updateSensorlessOvenReportApi(pk: number, data: SensorlessOvenReportUpdatePayload) {
  return request<SensorlessOvenReportMutationResponse>({
    url: `test/sensorless-oven/report/detail/${pk}/`,
    method: "put",
    data
  })
}

export function deleteSensorlessOvenReportApi(pk: number) {
  return request<SensorlessOvenReportMutationResponse>({
    url: `test/sensorless-oven/report/detail/${pk}/`,
    method: "delete"
  })
}
