export interface SimulatedWellOrderListItem {
  id: number
  task_number: string
  customer_unit?: string
  task_desc?: string
  device_count?: number
  plan_date?: string | null
  status: number
  status_text?: string
  sanxin_applicant_item_1?: "yes" | "no" | null
  sanxin_applicant_item_2?: "yes" | "no" | null
  sanxin_applicant_item_3?: "yes" | "no" | null
  sanxin_applicant_item_4?: "yes" | "no" | null
  sanxin_applicant_item_5?: "yes" | "no" | null
  sanxin_applicant_signer?: string | null
  sanxin_confirm_date?: string | null
  sanxin_tester_item_1?: "yes" | "no" | null
  sanxin_tester_item_2?: "yes" | "no" | null
  sanxin_is_sanxin?: boolean
  admin_signature_url?: string | null
  created_at: string
  updated_at: string
  devices?: { device_name: string; device_number: string }[]
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
