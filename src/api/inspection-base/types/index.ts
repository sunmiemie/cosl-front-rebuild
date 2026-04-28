export interface InspectionBaseInfoListRequest {
  device_name?: string
  device_sn?: string
  status?: string
  device_group?: string
  inspection_date?: string
  currentMonth?: string
  currentPage: number
  pageSize: number
}

export interface InspectionBaseInfoListItem {
  id: number
  inspection_no: string
  device_name: string
  device_sn: string
  inspector: string
  status: "正常" | "维保中" | "维修中"
  item_count: number
  inspection_date?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface InspectionBaseInfoDetailItem {
  id: number
  sort_no: number
  content: string
  require_photo: boolean
  created_at?: string | null
  updated_at?: string | null
}

export interface InspectionBaseInfoDetail {
  id: number
  inspection_no: string
  device_name: string
  device_sn: string
  inspector: string
  status: "正常" | "维保中" | "维修中"
  inspection_date?: string | null
  created_at?: string | null
  updated_at?: string | null
  items: InspectionBaseInfoDetailItem[]
}

export interface InspectionBaseInfoListResponse {
  code: number
  msg: string
  message?: string
  data: {
    list: InspectionBaseInfoListItem[]
    total: number
    currentPage: number
    pageSize: number
  }
}

export interface InspectionBaseInfoDetailResponse {
  code: number
  msg: string
  message?: string
  data: InspectionBaseInfoDetail
}

export interface InspectionBaseInfoSaveRequest {
  id?: number
  device_name: string
  device_sn: string
  inspector: string
  status: "正常" | "维保中" | "维修中"
  items: Array<{
    sort_no?: number
    content: string
    require_photo: boolean
  }>
}

export interface InspectionBaseInfoSaveResponse {
  code: number
  msg: string
  message?: string
  data: {
    id: number
    inspection_no: string
  }
}
