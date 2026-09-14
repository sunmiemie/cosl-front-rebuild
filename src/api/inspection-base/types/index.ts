export type InspectionResultType = 0 | 1

export interface InspectionUserOption {
  id: string
  name: string
  department_id: string
  department_name: string
  telPhone?: string
  phone?: string
  email?: string
}

export interface InspectionUserOptionsResponse {
  code: number
  msg: string
  message?: string
  data: InspectionUserOption[]
}

export interface InspectionBaseInspector {
  id: string
  name: string
  department: string
}

export interface InspectionDeviceConfigOverviewRequest {
  keyword?: string
  device_type?: string
  inspector?: string
  configured?: "true" | "false"
  currentPage: number
  pageSize: number
}

export interface InspectionDeviceConfigOverviewItem {
  device_id: number
  device_type: string
  device_name: string
  device_sn: string
  model_name: string
  configured: boolean
  config_id: number | null
  inspection_no: string
  inspector: string
  inspectors: InspectionBaseInspector[]
  item_count: number
  status: "正常" | "维保中" | "维修中" | ""
  updated_at: string | null
}

export interface InspectionDeviceConfigOverviewResponse {
  code: number
  msg: string
  message?: string
  data: {
    list: InspectionDeviceConfigOverviewItem[]
    total: number
    currentPage: number
    pageSize: number
    stats: {
      total: number
      configured: number
      unconfigured: number
    }
  }
}

export interface InspectionBaseInfoListRequest {
  device_id?: number
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
  device_id?: number | null
  device_type?: string
  device_name: string
  device_sn: string
  inspector: string
  assistant_inspector_user_id?: string | null
  inspector_name?: string
  inspector_department?: string
  inspectors?: InspectionBaseInspector[]
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
  inspector_user_id: number | null
  assistant_inspector_user_id: string | null
  inspector_name: string
  inspector_department: string
  require_photo: boolean
  photo?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface InspectionBaseInfoDetail {
  id: number
  inspection_no: string
  device_id: number | null
  device_type: string
  device_name: string
  device_sn: string
  inspector: string
  assistant_inspector_user_id: string | null
  inspector_name: string
  inspector_department: string
  inspectors: InspectionBaseInspector[]
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
  device_id: number
  device_type: string
  device_name: string
  device_sn: string
  inspector: string
  inspectors: InspectionBaseInspector[]
  status: "正常" | "维保中" | "维修中"
  assistant_equipment_type?: string
  items: Array<{
    item_id?: number
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
    device_id: number
    device_type: string
    device_name: string
    device_sn: string
    inspector: string
    assistant_inspector_user_id: string
    inspector_name: string
    inspector_department: string
    inspectors: InspectionBaseInspector[]
    items: Array<{
      id: number
      sort_no: number
      content: string
      result_type: InspectionResultType
      require_photo: boolean
      photo?: string | null
    }>
    assistantSync?: {
      success: boolean
      synced: number
      failed?: number
      message?: string
      payload?: InspectionAssistantPushPayload
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
  inspectors?: InspectionBaseInspector[]
  status: "正常" | "维保中" | "维修中"
  assistant_equipment_type?: string
  sort_no?: number
  content: string
  result_type: InspectionResultType
  assistant_inspector_user_id: string
  inspector_name: string
  inspector_department: string
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
    inspector: string
    inspectors?: InspectionBaseInspector[]
    item: InspectionBaseInfoDetailItem
    assistantSync?: {
      success: boolean
      synced: number
      message?: string
      payload?: InspectionAssistantPushPayload
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
    inspector: string
  }
}

export interface InspectionBaseAssistantSyncRequest {
  equipmentType: string
  dryRun?: boolean
}

export interface InspectionAssistantPushPayload {
  equipmentId: string
  equipmentName: string
  sn: string
  equipmentType: string
  inspectionPersons: Array<{
    inspectionPersonId: string
    inspectionPersonName: string
    inspectionPersonDept: string
  }>
  inspectionItems: Array<{
    itemId: string
    itemContent: string
    orderNum: string
    isPhoto: boolean
    resultType: InspectionResultType
  }>
}

export interface InspectionBaseAssistantSyncResponse {
  code: number
  msg: string
  message?: string
  data: {
    synced: number
    payload?: InspectionAssistantPushPayload
    assistant?: unknown
  }
}

export interface AssistantInspectionPhoto {
  itemPhotoName: string
  itemPhotoBase64: string
}

export interface AssistantInspectionResultItem {
  itemId: string | number
  itemContent?: string
  itemName?: string
  content?: string
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
