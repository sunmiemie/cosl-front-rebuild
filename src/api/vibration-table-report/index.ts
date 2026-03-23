import { request } from "@/utils/service"

export interface VibrationTableReportListItem {
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

export function getVibrationTableReportListApi(params: {
  page: number
  pageSize: number
  taskNumber?: string
  tester?: string
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

export function createVibrationTableReportApi(data: any) {
  return request({
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

export function updateVibrationTableReportApi(pk: number, data: any) {
  return request({
    url: `test/vibration-table/report/detail/${pk}/`,
    method: "put",
    data
  })
}

export function deleteVibrationTableReportApi(pk: number) {
  return request({
    url: `test/vibration-table/report/detail/${pk}/`,
    method: "delete"
  })
}
