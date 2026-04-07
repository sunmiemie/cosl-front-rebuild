export interface HighTempPressureOrderListItem {
  id: number
  test_platform: string
  test_date: string
  device_name: string
  device_number: string
  task_number: string
  target_temp: number
  target_pressure: number
  applicant: string
  remark: string
  status: number
  status_text?: string
  created_at: string
  updated_at: string
}

export interface HighTempPressureOrderListRequest {
  page: number
  pageSize: number
  taskNumber?: string
  status?: string
}

export interface HighTempPressureOrderListResponse {
  code: number
  data: {
    list: HighTempPressureOrderListItem[]
    total: number
    page: number
    pageSize: number
  }
  msg?: string
}

export interface CreateHighTempPressureOrderRequest {
  test_platform: string
  test_date: string
  device_name: string
  device_number: string
  task_number: string
  target_temp: number
  target_pressure: number
  applicant: string
  remark?: string
}

export interface HighTempPressureOrderDetailResponse {
  code: number
  data: HighTempPressureOrderListItem
  msg?: string
}
