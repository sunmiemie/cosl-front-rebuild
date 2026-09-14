export interface HighTempPressureOrderListItem {
  id: number
  table_no?: string
  test_platform: string
  test_date: string
  device_name: string
  device_number: string
  task_number: string
  test_number?: string | null
  target_temp: number
  target_pressure: number
  applicant: string
  applicant_phone?: string
  test_application_unit?: string
  test_application_unit_manager?: string
  application_date?: string | null
  research_number?: string
  project_budget_number?: string
  project_name?: string
  client?: string
  planned_time?: string | null
  test_location?: string | null
  test_purpose?: string | null
  others?: unknown
  test_type?: string
  test_container?: string
  online_test?: boolean | null
  project_members?: string
  equipment_list?: string
  instrument_combination?: string
  test_steps?: string
  safety_risks?: string
  remark: string
  use_device?: string
  max_diameter?: number | null
  hold_time?: number | null
  admin_signature_url?: string | null
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
  instrument_count?: number
  instrument_names?: string
  instrument_sns?: string
  test_types?: string
  instruments?: HighTempPressureOrderInstrumentItem[]
  status: number
  status_text?: string
  created_at: string
  updated_at: string
}

export interface HighTempPressureOrderInstrumentItem {
  id?: number
  instrument_name: string
  instrument_sn: string
  test_type?: string
  quantity?: number
  instrument_length?: string
  max_diameter?: number | null
  scheduled_start_at?: string | null
  scheduled_end_at?: string | null
  schedule_segments?: Array<{
    scheduled_start_at?: string | null
    scheduled_end_at?: string | null
  }> | null
  instrument_status?: number
  is_completed?: boolean
  completed_at?: string | null
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
  table_no?: string
  test_platform: string
  test_date: string
  device_name: string
  device_number: string
  task_number: string
  target_temp: number
  target_pressure: number
  applicant: string
  applicant_phone?: string
  test_application_unit?: string
  test_application_unit_manager?: string
  application_date?: string | null
  research_number?: string
  project_budget_number?: string
  project_name?: string
  client?: string
  planned_time?: string | null
  test_location?: string | null
  test_purpose?: string | null
  others?: unknown
  test_type?: string
  test_container?: string
  online_test?: boolean | null
  project_members?: string
  equipment_list?: string
  instrument_combination?: string
  test_steps?: string
  safety_risks?: string
  use_device?: string
  max_diameter?: number | null
  hold_time?: number | null
  instruments?: HighTempPressureOrderInstrumentItem[]
  remark?: string
}

export interface HighTempPressureOrderDetailResponse {
  code: number
  data: HighTempPressureOrderListItem
  msg?: string
}
