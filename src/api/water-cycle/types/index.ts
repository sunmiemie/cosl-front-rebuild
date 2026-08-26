export interface WaterCycleInstrumentItem {
  id?: number
  instrument_name: string
  sn_numbers: string
  quantity: number
  scheduled_start_at?: string | null
  scheduled_end_at?: string | null
  instrument_status?: number
  is_completed?: boolean
  completed_at?: string | null
}

export interface WaterCycleOrderListItem {
  id: number
  table_no: string
  task_number: string
  applicant: string
  applicant_phone?: string
  test_application_unit?: string
  test_application_unit_manager?: string
  research_number?: string
  application_date?: string
  project_budget_number?: string
  project_name: string
  device_name?: string
  device_number?: string
  quantity: number
  client?: string
  planned_time?: string
  test_location?: string | null
  test_purpose?: string
  others?: unknown
  test_type: string
  flow_process: string
  need_pressure_test?: string
  need_command_transfer?: string
  project_members?: string
  equipment_list?: string
  instrument_combination?: string
  test_steps?: string
  safety_risks?: string
  status: number
  status_text: string
  scheduled_start_at?: string | null
  scheduled_end_at?: string | null
  instruments?: WaterCycleInstrumentItem[]
  schedule_segments?: Array<{
    scheduled_start_at?: string | null
    scheduled_end_at?: string | null
  }> | null
  created_at: string
}

export interface WaterCycleOrderDetail extends WaterCycleOrderListItem {
  test_platform?: string
  test_date?: string
  start_time?: string
  end_time?: string
  instruments?: WaterCycleInstrumentItem[]
  remark?: string
  updated_at?: string
}
