export interface WaterCycleOrderListItem {
  id: number
  task_number: string
  applicant: string
  device_name: string
  flow_process: string
  status: number
  status_text: string
  created_at: string
}

export interface WaterCycleOrderDetail extends WaterCycleOrderListItem {
  test_platform: string
  test_date: string
  start_time: string
  end_time: string
  device_number: string
  need_pressure_test: string
  need_command_transfer: string
  remark: string
  updated_at: string
}
