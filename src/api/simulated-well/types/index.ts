export interface SimulatedWellOrderListItem {
  id: number
  table_number?: string
  task_number: string
  applicant?: string
  applicant_phone?: string
  test_unit?: string
  test_unit_manager?: string
  application_date?: string | null
  research_no?: string
  project_budget_no?: string
  project_name?: string
  tested_instrument?: string
  instrument_sn_numbers?: string
  quantity?: number
  client?: string
  entrusted_time?: string
  test_purpose?: string
  test_steps?: string
  safety_risks?: string
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
  table_number?: string
  task_number: string
  applicant?: string
  applicant_phone?: string
  test_unit?: string
  test_unit_manager?: string
  application_date?: string
  research_no?: string
  project_budget_no?: string
  project_name?: string
  tested_instrument?: string
  instrument_sn_numbers?: string
  quantity?: number
  client?: string
  entrusted_time?: string
  test_purpose?: string
  test_steps?: string
  safety_risks?: string
  customer_unit?: string
  task_desc?: string
  device_count?: number
  devices?: {
    id?: number
    device_name: string
    device_number: string
    scheduled_start_at?: string | null
    scheduled_end_at?: string | null
  }[]
  sanxin_applicant_item_1?: "yes" | "no"
  sanxin_applicant_item_2?: "yes" | "no"
  sanxin_applicant_item_3?: "yes" | "no"
  sanxin_applicant_item_4?: "yes" | "no"
  sanxin_applicant_item_5?: "yes" | "no"
  sanxin_applicant_signer?: string
}

export interface SimulatedWellOrderDetailResponse {
  code: number
  data: SimulatedWellOrderListItem
  msg?: string
}
