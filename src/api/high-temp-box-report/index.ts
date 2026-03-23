import { request } from "@/utils/service"

export interface HighTempBoxReportListItem {
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

export function getHighTempBoxReportListApi(params: {
  page: number
  pageSize: number
  taskNumber?: string
  tester?: string
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

export function createHighTempBoxReportApi(data: any) {
  return request({
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

export function updateHighTempBoxReportApi(pk: number, data: any) {
  return request({
    url: `test/high-temp-box/report/detail/${pk}/`,
    method: "put",
    data
  })
}

export function deleteHighTempBoxReportApi(pk: number) {
  return request({
    url: `test/high-temp-box/report/detail/${pk}/`,
    method: "delete"
  })
}
