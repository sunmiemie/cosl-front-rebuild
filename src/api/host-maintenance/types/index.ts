export interface HostMaintenanceListRequest {
  host_id?: number | string
  host_sn?: string
  work_order_no?: string
  usage_date?: string
  maintenance_date?: string
  maintenance_type?: string
  status?: string
  currentPage?: number
  pageSize?: number
}

export interface HostUsageRecordItem {
  id: number | string
  host_id: number | string
  host_sn: string
  host_name: string
  test_bench: string
  work_order_no: string
  usage_date?: string | null
  date?: string | null
  duration_hours: number
  status: string
  remark?: string
  created_at?: string | null
  updated_at?: string | null
}

export interface HostMaintenanceRecordItem {
  id: number | string
  host_id: number | string
  host_sn: string
  host_name: string
  maintenance_date?: string | null
  date?: string | null
  maintenance_type: string
  type?: string
  maintainer?: string
  person?: string
  content?: string
  result?: string
  remark?: string
  created_at?: string | null
  updated_at?: string | null
}

export interface HostMaintenanceConfigItem {
  id: number | string
  host_id: number | string
  host_sn: string
  host_name: string
  cycle_hours: number
  warning_threshold_hours: number
  last_maintenance_date?: string | null
  next_maintenance_date?: string | null
  total_hours: number
  remaining_hours: number
  status: string
}

export interface CreateHostUsageRecordRequest {
  host_id: number | string
  work_order_no?: string
  usage_date: string
  duration_hours: number
  status: string
  remark?: string
}

export interface UpdateHostUsageRecordRequest extends CreateHostUsageRecordRequest {}

export interface CreateHostMaintenanceRecordRequest {
  host_id: number | string
  maintenance_date: string
  maintenance_type: string
  maintainer?: string
  content?: string
  result?: string
  remark?: string
}

export interface UpdateHostMaintenanceRecordRequest extends CreateHostMaintenanceRecordRequest {}

export interface UpdateHostMaintenanceConfigRequest {
  host_id: number | string
  cycle_hours: number
  warning_threshold_hours: number
  last_maintenance_date?: string | null
  next_maintenance_date?: string | null
}

export interface HostMaintenanceListResponse<T> {
  code: number
  message?: string
  data: {
    list: T[]
    total: number
    currentPage: number
    pageSize: number
  }
}

export interface HostMaintenanceItemResponse<T> {
  code: number
  message?: string
  data: T
}
