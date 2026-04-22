export interface InstrumentModelItem {
  id: number
  instrument_manage_id: number
  instrument_manage_name?: string | null
  model_name: string
  model_number: string
  normal_cycle: number
  high_cycle: number
  coefficient: number
  remark?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface InstrumentModelListRequest {
  keyword?: string
  currentPage?: number
  pageSize?: number
  instrument_manage_id?: number
}

export interface InstrumentModelListResponse {
  code: number
  msg?: string
  data: {
    list: InstrumentModelItem[]
    total: number
    currentPage: number
    pageSize: number
  }
}

export interface CreateInstrumentModelRequest {
  instrument_manage_id?: number
  model_name: string
  model_number: string
  normal_cycle: number
  high_cycle: number
  coefficient: number
  remark?: string
}

export interface UpdateInstrumentModelRequest extends CreateInstrumentModelRequest {}
