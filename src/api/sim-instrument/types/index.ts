export interface SimInstrumentItem {
  id: number
  sn: string
  name: string
  status: string
  manufacturer?: string | null
  model_id: number
  model_name?: string | null
  model_number?: string | null
  temperature?: string | null
  normal_cycle?: number | null
  high_cycle?: number | null
  coefficient?: number | null
  model_remark?: string | null
  used_count: number
  remain_count: number
  created_at?: string | null
  updated_at?: string | null
}

export interface SimInstrumentListRequest {
  sn?: string
  name?: string
  model_number?: string
  status?: string
  currentPage?: number
  pageSize?: number
}

export interface SimInstrumentListResponse {
  code: number
  msg?: string
  data: {
    list: SimInstrumentItem[]
    total: number
    currentPage: number
    pageSize: number
  }
}

export interface SimInstrumentDetailResponse {
  code: number
  msg?: string
  data: SimInstrumentItem
}

export interface CreateSimInstrumentRequest {
  sn: string
  name: string
  manufacturer?: string
  model_id: number
  status: string
  used_count: number
  remain_count: number
}

export interface UpdateSimInstrumentRequest extends CreateSimInstrumentRequest {}
