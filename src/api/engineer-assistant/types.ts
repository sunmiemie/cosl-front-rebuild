export type EngineerAssistantBaseResponse<T> = {
  code: number
  msg?: string
  data: T
}

export type EngineerAssistantListData<T> = {
  list: T[]
  total: number
  source?: string
}

export type EngineerAssistantUser = {
  id: string
  userId: string
  name: string
  userName: string
  departmentId?: string
  departmentName?: string
  raw?: unknown
}

export type EngineerAssistantTestType = {
  id: string
  number?: string
  typeId: string
  name: string
  typeName: string
  raw?: unknown
}

export type EngineerAssistantTestStatus = {
  value: string
  label: string
  lable?: string
  raw?: unknown
}

export type EngineerAssistantApplicationBaseInfo = Record<string, unknown> & {
  csdd?: string
  csmd?: string
  others?: unknown
}

export type EngineerAssistantApplicationForm = {
  testId: string
  testType: string
  testTypeName?: string
  status?: string
  zt?: string
  baseInfo?: EngineerAssistantApplicationBaseInfo
  csdd?: string
  csmd?: string
  others?: unknown
  instruments?: unknown[]
  devices?: unknown[]
  users?: unknown[]
  raw?: unknown
}

export type GetEngineerAssistantUsersResponse = EngineerAssistantBaseResponse<
  EngineerAssistantListData<EngineerAssistantUser>
>
export type GetEngineerAssistantTestTypesResponse = EngineerAssistantBaseResponse<
  EngineerAssistantListData<EngineerAssistantTestType>
>
export type GetEngineerAssistantTestStatusesResponse = EngineerAssistantBaseResponse<
  EngineerAssistantListData<EngineerAssistantTestStatus>
>
export type GetEngineerAssistantApplicationFormsResponse = EngineerAssistantBaseResponse<
  EngineerAssistantListData<EngineerAssistantApplicationForm>
>
export type GetEngineerAssistantApplicationFormDetailResponse =
  EngineerAssistantBaseResponse<EngineerAssistantApplicationForm>

export type SyncEngineerAssistantApplicationFormsBody = {
  dryRun: boolean
  testType?: string
  limit?: number
  pushStatus?: boolean
}

export type EngineerAssistantApplicationFormsSyncResult = {
  summary: {
    dryRun: boolean
    pushStatus: boolean
    total: number
    success: number
    failed: number
    skipped: number
    processed: number
  }
  list: Array<Record<string, unknown>>
}

export type SyncEngineerAssistantApplicationFormsResponse =
  EngineerAssistantBaseResponse<EngineerAssistantApplicationFormsSyncResult>

export type PushEngineerAssistantProcessesBody = {
  processDtoList: Array<{
    testTypeId: string
    testTypeName: string
    list: Array<{
      processId: string
      processName: string
      processDescription: string
      xssj: string
    }>
  }>
}

export type PushEngineerAssistantEquipmentBody = {
  testEquipmentDtoList: Array<{
    testTypeId?: string
    equipmentId: string
    equipmentName: string
    sn: string
  }>
}

export type EngineerAssistantScheduleInfo = {
  testId: string
  testType: string
  equipmentId: string
  startTime: string
  endTime: string
}

export type PushEngineerAssistantSchedulesBody = {
  schedulesInfo: EngineerAssistantScheduleInfo[]
}

export type SyncEngineerAssistantLocalScheduleBody = {
  orderType: "high-temp-box" | "high-temp-pressure" | "water-cycle" | "vibration-table" | "simulated-well"
  targetId: number
  equipmentId?: string
  dryRun?: boolean
}

export type EngineerAssistantReportAction = "preview" | "push"

export type EngineerAssistantLocalReportType =
  | "circuit-board"
  | "high-temp-box"
  | "high-temp-pressure"
  | "water-cycle"
  | "vibration-table"
  | "simulated-well"

export type EngineerAssistantReportFile = {
  filename: string
  equipmentId?: string
  equipmentName?: string
  boardId?: string
  fileContent: string
  description: string
  status: string
}

export type EngineerAssistantReportPayload = {
  id: string
  testType: string
  status: string
  data: EngineerAssistantReportFile[]
}

type SyncEngineerAssistantReportsLocalBase = {
  source: "local"
  action: EngineerAssistantReportAction
  reportType: EngineerAssistantLocalReportType
}

export type SyncEngineerAssistantReportsLocalBody = SyncEngineerAssistantReportsLocalBase & {
  reportId: number
  /** 人工重新推送时强制覆盖小助手端当前申请单报告快照 */
  force?: boolean
}

export type SyncEngineerAssistantReportsPayloadBody = {
  source: "payload"
  action: EngineerAssistantReportAction
  verifyStatus?: boolean
  testReportList: EngineerAssistantReportPayload[]
}

export type SyncEngineerAssistantReportsBody =
  | SyncEngineerAssistantReportsLocalBody
  | SyncEngineerAssistantReportsPayloadBody

export type EngineerAssistantReportSyncItem = {
  success?: boolean
  skipped?: boolean
  reason?: string
  error?: string
  reportId?: number
  testId?: string
  testType?: string
  equipmentId?: string
  wouldPush?: boolean
}

export type EngineerAssistantReportSyncResult = {
  success?: boolean
  dryRun?: boolean
  total?: number
  eligible?: number
  wouldPush?: boolean
  wouldPushCount?: number
  attempted?: number
  synced?: number
  failed?: number
  skipped?: number
  error?: string
  list?: EngineerAssistantReportSyncItem[]
  result?: EngineerAssistantReportSyncResult
  summary?: Partial<EngineerAssistantReportSyncResult>
  [key: string]: unknown
}

export type AssistantReportSyncFeedback = {
  attempted?: boolean
  success?: boolean
  skipped?: boolean
  retryable?: boolean
  reason?: string
  message?: string
  error?: string
  total?: number
  synced?: number
  failed?: number
  list?: EngineerAssistantReportSyncItem[]
}

export type ChangeEngineerAssistantStatusBody = {
  testType: string
  id: string
  status: string
  description: string
}

export type EngineerAssistantCommissionOrderSample = {
  id: string
  commissionOrderId: string
  sampleName: string
  category: string
  specModel?: string
  manufacturer?: string
  batchNo?: string
  sn?: string
  materialNo?: string
  testContent?: string
  number: number
}

export type EngineerAssistantCommissionOrder = {
  id: string
  commissionId: string
  budgetId?: string
  commissionOrg: string
  userName: string
  userId: string
  departmentId?: string
  departmentName?: string
  phone?: string
  samples: EngineerAssistantCommissionOrderSample[]
}

export type PushEngineerAssistantCommissionOrdersBody = {
  orderList: EngineerAssistantCommissionOrder[]
}

export type EngineerAssistantCommissionBinding = {
  applicationNum?: string
  orderId?: string
  sampleId?: string
  boardId?: string
  applicationId?: string
  fpNumber?: string
  raw?: unknown
}

export type GetEngineerAssistantCommissionBindingsParams = {
  applicationNum?: string
}

export type PushEngineerAssistantCommissionOrdersResponse = EngineerAssistantBaseResponse<unknown>
export type SyncEngineerAssistantLocalResponse = EngineerAssistantBaseResponse<Record<string, unknown>>
export type SyncEngineerAssistantReportsResponse = EngineerAssistantBaseResponse<EngineerAssistantReportSyncResult>
export type GetEngineerAssistantCommissionBindingsResponse = EngineerAssistantBaseResponse<
  EngineerAssistantCommissionBinding[]
>
