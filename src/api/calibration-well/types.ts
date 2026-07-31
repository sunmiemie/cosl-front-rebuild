/** 刻度井 API 原始结构（snake_case） */
export type ApiDeviceRole = "instrument" | "instrument_b" | "data_stick" | "power_supply"

export interface ApiWellCommConfig {
  device_role: ApiDeviceRole
  vid?: string
  pid?: string
  adapter_serial?: string
  baud_rate?: number
  transport?: "lan" | "serial"
  host?: string
  port?: number
  /** @deprecated legacy */
  connection_mode?: string
  /** @deprecated legacy */
  port_legacy?: string
}

export interface ApiCalibrationWell {
  id: number
  well_no: string
  well_name: string
  well_type: "hi" | "lo"
  well_type_text?: string
  api_value: string | number | null
  dual_sensor: boolean
  hole_diameter: number | null
  comm_configs: ApiWellCommConfig[]
  data_source: "mock" | "live"
  status: number
  remark?: string
  ref_min?: string | number
  ref_max?: string | number
  ka_min?: string | number
  ka_max?: string | number
  ba_limit?: string | number
  kb_min?: string | number
  kb_max?: string | number
  bb_limit?: string | number
  created_at?: string
  updated_at?: string
}

export interface WellOptionItem {
  id: number
  wellNo: string
  wellName: string
  wellType: "hi" | "lo"
  apiValue: number | null
  dualSensor: boolean
  holeDiameter: number | null
  commConfigs: ApiWellCommConfig[]
  dataSource?: "mock" | "live"
  refMin?: number
  refMax?: number
  kaMin?: number
  kaMax?: number
  baLimit?: number
  kbMin?: number
  kbMax?: number
  bbLimit?: number
  label: string
}

export interface WellListRequest {
  keyword?: string
  wellType?: string
  well_type?: string
  status?: string | number
  page?: number
  pageSize?: number
}

export interface WellListResponse {
  code: number
  data: {
    list: ApiCalibrationWell[]
    total: number
    page: number
    pageSize: number
  }
  msg?: string
}

export interface WellOptionsResponse {
  code: number
  data: WellOptionItem[]
  msg?: string
}

export interface WellMutationResponse {
  code: number
  data?: ApiCalibrationWell
  msg?: string
}

export interface ApiCalibrationInstrumentModel {
  id: number
  display_name: string
  serial_numbers: string[]
  serial_count?: number
  hi_well_id: number
  lo_well_id: number
  hi_well_no?: string
  hi_well_name?: string
  hi_well_api?: string | number | null
  hi_well_dual_sensor?: boolean
  hi_well_ka_min?: string | number
  hi_well_ka_max?: string | number
  hi_well_ba_limit?: string | number
  lo_well_no?: string
  lo_well_name?: string
  lo_well_api?: string | number | null
  lo_well_kb_min?: string | number
  lo_well_kb_max?: string | number
  lo_well_bb_limit?: string | number
  status: number
  remark?: string
  created_at?: string
  updated_at?: string
}

export interface ModelOptionItem {
  id: number
  displayName: string
  hiWellId?: number
  loWellId?: number
  hiWellNo: string
  loWellNo: string
  hiWellApi?: number | null
  loWellApi?: number | null
  hiWellDualSensor?: boolean
  loWellDualSensor?: boolean
  hiWellKaMin?: number
  hiWellKaMax?: number
  hiWellBaLimit?: number
  loWellKbMin?: number
  loWellKbMax?: number
  loWellBbLimit?: number
  serialNumbers?: string[]
  label: string
}

export interface ModelListRequest {
  keyword?: string
  status?: string | number
  page?: number
  pageSize?: number
}

export interface ModelListResponse {
  code: number
  data: {
    list: ApiCalibrationInstrumentModel[]
    total: number
    page: number
    pageSize: number
  }
  msg?: string
}

export interface ModelOptionsResponse {
  code: number
  data: ModelOptionItem[]
  msg?: string
}

export interface ModelMutationResponse {
  code: number
  data?: ApiCalibrationInstrumentModel
  msg?: string
}

export interface ApiCalibrationWorkOrder {
  id: number
  task_number: string
  instrument_model_id: number
  instrument_model_name: string
  serial_number: string
  tester_id: number | null
  tester_name: string
  location: string
  calibration_device: string
  hi_well_id: number
  lo_well_id: number
  hi_well_no: string
  lo_well_no: string
  hi_well_api: string | number | null
  lo_well_api: string | number | null
  hi_well_comm_configs?: ApiWellCommConfig[]
  lo_well_comm_configs?: ApiWellCommConfig[]
  hi_well_data_source?: "mock" | "live"
  lo_well_data_source?: "mock" | "live"
  hi_well_ref_min?: string | number
  hi_well_ref_max?: string | number
  hi_well_ka_min?: string | number
  hi_well_ka_max?: string | number
  hi_well_ba_limit?: string | number
  lo_well_ref_min?: string | number
  lo_well_ref_max?: string | number
  lo_well_kb_min?: string | number
  lo_well_kb_max?: string | number
  lo_well_bb_limit?: string | number
  dual_sensor?: boolean
  plan_date: string | null
  kc: string | number | null
  status: number
  status_text?: string
  remark?: string
  scheduled_start_at?: string | null
  scheduled_end_at?: string | null
  schedule_segments?: unknown[]
  created_at?: string
  updated_at?: string
}

export interface OrderListRequest {
  keyword?: string
  status?: string | number
  page?: number
  pageSize?: number
}

export interface OrderListResponse {
  code: number
  data: {
    list: ApiCalibrationWorkOrder[]
    total: number
    page: number
    pageSize: number
  }
  msg?: string
}

export interface OrderMutationResponse {
  code: number
  data?: ApiCalibrationWorkOrder
  msg?: string
}

export interface ApiDashboardStatSummary {
  key: string
  label: string
  value: string | number
  unit: string
  icon_key: string
  trend_text: string
  trend_type: "up" | "down" | "flat"
}

export interface DashboardResponse {
  code: number
  data: {
    stat_summary: ApiDashboardStatSummary[]
    daily_calibration_counts: number[]
    recent_orders: Array<{
      id: number
      task_number: string
      serial_number: string
      status: number
      status_text: string
      plan_date: string | null
    }>
  }
  msg?: string
}
