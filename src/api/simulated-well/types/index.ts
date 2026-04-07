export interface SimulatedWellOrderListItem {
  id: number
  test_platform: string
  test_date: string
  device_name: string
  device_number: string
  task_number: string
  well_depth: number
  well_temp: number
  applicant: string
  remark: string
  status: number
  status_text?: string
  created_at: string
  updated_at: string
}

export interface SimulatedWellOrderListRequest {
  page: number
  pageSize: number
  taskNumber?: string
  status?: string
}

export interface SimulatedWellOrderListResponse {
  code: number
  data: {
    list: SimulatedWellOrderListItem[]
    total: number
    page: number
    pageSize: number
  }
  msg?: string
}

export interface CreateSimulatedWellOrderRequest {
  test_platform: string
  test_date: string
  device_name: string
  device_number: string
  task_number: string
  well_depth: number
  well_temp: number
  applicant: string
  remark?: string
}

export interface SimulatedWellOrderDetailResponse {
  code: number
  data: SimulatedWellOrderListItem
  msg?: string
}
