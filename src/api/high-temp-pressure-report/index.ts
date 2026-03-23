import { request } from "@/utils/service"

export interface HighTempPressureReportListItem {
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

export function getHighTempPressureReportListApi(params: {
  page: number
  pageSize: number
  taskNumber?: string
  tester?: string
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

export function createHighTempPressureReportApi(data: any) {
  return request({
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

export function updateHighTempPressureReportApi(pk: number, data: any) {
  return request({
    url: `test/high-temp-pressure/report/detail/${pk}/`,
    method: "put",
    data
  })
}

export function deleteHighTempPressureReportApi(pk: number) {
  return request({
    url: `test/high-temp-pressure/report/detail/${pk}/`,
    method: "delete"
  })
}
