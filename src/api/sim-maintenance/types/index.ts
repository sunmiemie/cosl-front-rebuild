export interface SimMaintenanceListRequest {
  instrument_id?: number | string
  model?: string
  model_number?: string
  sn?: string
  jobId?: string
  work_no?: string
  date?: string
  status?: string
  currentPage?: number
  pageSize?: number
}

export interface SimInstrumentUsageRecordItem {
  id: number | string
  model_number: string
  sn: string
  work_no: string
  used_count: number
  remain_count: number
  status: string
  temperature?: string | number | null
  duration?: string | number | null
  created_at?: string | null
}

export interface SimInstrumentMaintenanceReminderItem {
  id: number | string
  model_number: string
  sn: string
  work_no?: string | null
  used_count: number
  remain_count: number
  threshold?: number | null
  status: string
  created_at?: string | null
}

export interface SimInstrumentMaintenanceRecordItem {
  id: number | string
  instrument_id: number | string
  model_number: string
  sn: string
  instrument_sn?: string
  instrument_name?: string
  maintenance_type: string
  type?: string
  maintenance_date?: string | null
  date?: string | null
  maintainer?: string
  person?: string
  content?: string
  result?: string
  remark?: string
  created_at?: string | null
  updated_at?: string | null
}

export interface CreateSimInstrumentMaintenanceRecordRequest {
  instrument_id: number
  maintenance_type: string
  maintenance_date: string
  maintainer?: string
  content?: string
  result?: string
  remark?: string
}

export interface UpdateSimInstrumentMaintenanceRecordRequest extends CreateSimInstrumentMaintenanceRecordRequest {}

export interface SimMaintenanceListResponse<T> {
  code: number
  msg?: string
  data: {
    list: T[]
    total: number
    currentPage: number
    pageSize: number
  }
}

export interface SimMaintenanceItemResponse<T> {
  code: number
  msg?: string
  data: T
}
