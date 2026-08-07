export type InspectionResultType = 0 | 1

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
  result_type: InspectionResultType
  require_photo: boolean
  photo?: string | null
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
  assistant_equipment_type?: string
  items: Array<{
    sort_no?: number
    content: string
    result_type: InspectionResultType
    require_photo: boolean
    photo?: string | null
  }>
}

export interface InspectionBaseInfoSaveResponse {
  code: number
  msg: string
  message?: string
  data: {
    id: number
    inspection_no: string
    assistantSync?: {
      success: boolean
      synced: number
      message?: string
      payload?: {
        equipmentType: string
        inspectionItems: Array<{
          itemId: string
          itemContent: string
          orderNum: string
          isPhoto: boolean
          resultType: InspectionResultType
        }>
      }
      assistant?: unknown
    }
  }
}

export interface InspectionBaseItemSaveRequest {
  base_id?: number
  item_id?: number
  device_name: string
  device_sn: string
  inspector: string
  status: "正常" | "维保中" | "维修中"
  assistant_equipment_type?: string
  sort_no?: number
  content: string
  result_type: InspectionResultType
  require_photo: boolean
  photo?: string | null
}

export interface InspectionBaseItemSaveResponse {
  code: number
  msg: string
  message?: string
  data: {
    id: number
    inspection_no: string
    item: InspectionBaseInfoDetailItem
    assistantSync?: {
      success: boolean
      synced: number
      message?: string
      payload?: {
        equipmentType: string
        inspectionItems: Array<{
          itemId: string
          itemContent: string
          orderNum: string
          isPhoto: boolean
          resultType: InspectionResultType
        }>
      }
      assistant?: unknown
    }
  }
}

export interface InspectionBaseItemDeleteResponse {
  code: number
  msg: string
  message?: string
  data: {
    base_id: number
    item_id: number
  }
}

export interface InspectionBaseAssistantSyncRequest {
  equipmentType: string
  dryRun?: boolean
}

export interface InspectionBaseAssistantSyncResponse {
  code: number
  msg: string
  message?: string
  data: {
    synced: number
    payload?: {
      equipmentType: string
      inspectionItems: Array<{
        itemId: string
        itemContent: string
        orderNum: string
        isPhoto: boolean
        resultType: InspectionResultType
      }>
    }
    assistant?: unknown
  }
}

export interface AssistantInspectionPhoto {
  itemPhotoName: string
  itemPhotoBase64: string
}

export interface AssistantInspectionResultItem {
  itemId: string
  planDate?: string
  actualDate?: string
  explains?: string
  bz?: string
  photos?: AssistantInspectionPhoto[]
}

export interface AssistantInspectionParticipant {
  inspectionPersonId: string
  inspectionPersonName: string
  inspectionPersonDept: string
}

export interface AssistantInspectionResult {
  id: string
  equipmentType: string
  equipmentTypeName: string
  equipmentId: string
  inspectionDate: string
  sn: string
  participants?: AssistantInspectionParticipant[]
  items?: AssistantInspectionResultItem[]
}

export interface AssistantInspectionResultsResponse {
  code: number
  msg: string
  message?: string
  data: AssistantInspectionResult[]
}
