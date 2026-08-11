import { request } from "@/utils/service"

export interface GetCircuitModuleApplicationsParams {
  search?: string
  status?: string
  device?: string
  orderNo?: string
  commissionNo?: string
}

export type CircuitModuleGeneratedOrderType = "production" | "temporary"

export interface DlbCircuitBoardItem {
  id?: string | number
  dlbTestId?: string | number
  board_id?: string | number
  boardId?: string | number
  prodBoardId?: string | number
  prod_board_id?: string | number
  tempBoardId?: string | number
  temp_board_id?: string | number
  instrumentModelId?: string | number
  instrument_model_id?: string | number
  productModelId?: string | number
  product_model_id?: string | number
  instrumentModelName?: string
  productModelName?: string
  sscp?: string
  product?: string
  ypmc?: string
  wlh?: string
  ggxh?: string
  gysmc?: string
  pch?: string
  batchNo?: string
  batch_id?: string | number
  batchId?: string | number
  sl?: string | number
  sn?: string
  assistantSn?: string
  assistant_sn?: string
  sourceSn?: string
  source_sn?: string
  originalSn?: string
  original_sn?: string
  seria?: string
  serial?: string
  serial_num?: string
  serialNumber?: string
  board_serial?: string
  wtr?: string
  ssdw?: string
  cslb?: string
  csnr?: string
  cjfj?: string
  hth?: string
  dhrq?: string
  ray?: string
  gqd?: string
  towtest?: string
  threetest?: string
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  status?: string | number
  publishStatus?: string | number
  publish_status?: string | number
}

export interface DlbCircuitApplicationRaw {
  id?: string | number
  djbh?: string
  wtdw?: string
  kybh?: string
  xmysbh?: string
  xmmc?: string
  address?: string
  telphone?: string
  sqrq?: string
  sqrmc?: string
  sqrdh?: string
  zj?: string
  sylx?: string
  dlbzt?: string | number
  csgy?: string
  filename?: string
  ssdw?: string
  ssdwqt?: string
  sfxyjcgy?: string
  labelList?: unknown[]
  ggxh?: string
  sl?: string | number
  sccj?: string
  bsh?: string
  zt?: string | number
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  dlbTestBoardList?: DlbCircuitBoardItem[]
}

export interface CircuitModuleScheduleSegment {
  scheduled_start_at?: string
  scheduled_end_at?: string
  sequence_only?: boolean
  sequence_order?: number
}

export interface CircuitModuleBoardItem {
  id?: string | number
  board_id?: string | number
  boardId?: string | number
  prodBoardId?: string | number
  prod_board_id?: string | number
  tempBoardId?: string | number
  temp_board_id?: string | number
  instrumentModelId?: string | number
  instrument_model_id?: string | number
  productModelId?: string | number
  product_model_id?: string | number
  instrumentModelName?: string
  productModelName?: string
  seria?: string
  sn?: string
  assistantSn?: string
  assistant_sn?: string
  sourceSn?: string
  source_sn?: string
  originalSn?: string
  original_sn?: string
  serial?: string
  serial_num?: string
  serialNumber?: string
  board_serial?: string
  name?: string
  sampleName?: string
  model?: string
  batchNo?: string
  batch_id?: string | number
  batchId?: string | number
  pch?: string
  supplier?: string
  gysmc?: string
  materialNo?: string
  material_no?: string
  wlh?: string
  quantity?: string | number
  sl?: string | number
  consignor?: string
  wtr?: string
  product?: string
  instrument?: string
  sscp?: string
  unit?: string
  ssdw?: string
  testCategory?: string
  cslb?: string
  testContent?: string
  csnr?: string
  initialInspection?: string
  cjfj?: string
  contractNo?: string
  hth?: string
  arrivalDate?: string
  dhrq?: string
  xray?: string
  ray?: string
  bow?: string
  gqd?: string
  twoD?: string
  towtest?: string
  threeD?: string
  threetest?: string
  status?: string | number
  publishStatus?: string | number
  publish_status?: string | number
  startTime?: string
}

export interface CircuitModuleApplicationRelation {
  id?: number
  assistantTestId?: string | null
  assistant_test_id?: string | null
  testId?: string | null
  sn: string
  djbh?: string
  wtdw?: string
  kybh?: string
  xmysbh?: string
  xmmc?: string
  address?: string
  telphone?: string
  sqrq?: string
  sqrmc?: string
  sqrdh?: string
  zj?: string
  sylx?: string
  dlbzt?: string | number
  csgy?: string
  filename?: string
  ssdw?: string
  ssdwqt?: string
  sfxyjcgy?: string
  labelList?: unknown[]
  ggxh?: string
  sl?: string | number
  sccj?: string
  bsh?: string
  zt?: string | number
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  dlbTestBoardList?: DlbCircuitBoardItem[]
  orderNo?: string
  moduleName?: string
  sampleName?: string
  specModel?: string
  quantity?: number
  device?: string
  hours?: number | null
  inspector?: string
  doneAt?: string | null
  applicant?: string
  phone?: string
  client?: string
  commissionNo?: string
  nature?: string
  remark?: string
  status?: string | number
  statusText?: string
  boards?: CircuitModuleBoardItem[]
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduleSegments?: CircuitModuleScheduleSegment[]
  isSequenceScheduled?: boolean
  sequenceOrder?: number | string | null
  updatedAt?: string
}

export interface CircuitModuleApplicationListResponse {
  code: number
  msg?: string
  data: {
    list: CircuitModuleApplicationRelation[]
    total: number
    stats?: {
      total: number
      linked: number
      unlinked: number
    }
  }
}

export interface CircuitModuleApplicationSyncResponse {
  code: number
  msg?: string
  data: {
    updated: number
    autoScheduled?: Array<{
      orderId: number
      sequenceOrder: number | null
      scheduled: boolean
      reason: string
      assistantPush: {
        success: boolean
        skipped: boolean
        reason: string
        error?: string
      } | null
    }>
  }
}

export interface EnsureCircuitModuleProductionBoardsRequest {
  orderNo: string
  boardSns: string[]
}

export interface EnsuredCircuitModuleProductionBoard {
  id: string | number
  sn: string
  boardModelId: string | number
  batchId: string | number
  instrumentId: string | number | null
}

export interface EnsureCircuitModuleProductionBoardsResponse {
  code: number
  msg?: string
  data: {
    createdCount: number
    existingCount: number
    boards: EnsuredCircuitModuleProductionBoard[]
  }
}

export interface PublishCircuitModuleMissingBoard {
  sn: string
  pch: string
  gysmc: string
  ggxh: string
}

export interface PublishCircuitModuleApplicationMissingBoardData {
  reason: "missing_board_match"
  missingBoards: PublishCircuitModuleMissingBoard[]
}

export interface CircuitModuleBindingBoard {
  boardId: string
  sampleName: string
  specModel: string | null
  batchNo: string | null
  quantity: number
  snList: string[]
  orderId: string | null
  commissionNo: string | null
  sampleId: string | null
  commissionSampleName: string | null
  commissionSampleSpec: string | null
  fpNumber: number
}

export interface CircuitModuleBindingSnapshot {
  applicationId: string | null
  applicationNum: string
  syncStatus: string
  syncRequestId: string | null
  syncError: string | null
  syncedAt: string | null
  boardList: CircuitModuleBindingBoard[]
  assistantSync?: {
    success?: boolean
    skipped?: boolean
    message?: string
    error?: string
    response?: unknown
  }
}

export interface CircuitModuleBindingSnapshotResponse {
  code: number
  msg?: string
  message?: string
  data: CircuitModuleBindingSnapshot
}

export interface SaveCircuitModuleBindingSnapshotRequest {
  applicationNum: string
  boardList: Array<Pick<CircuitModuleBindingBoard, "boardId" | "orderId" | "commissionNo" | "sampleId" | "fpNumber">>
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object"
}

function isStringValue(value: unknown): value is string {
  return typeof value === "string"
}

function isPublishMissingBoard(value: unknown): value is PublishCircuitModuleMissingBoard {
  return (
    isObjectRecord(value) &&
    isStringValue(value.sn) &&
    isStringValue(value.pch) &&
    isStringValue(value.gysmc) &&
    isStringValue(value.ggxh)
  )
}

export function isCircuitModulePublishMissingBoardData(
  data: unknown
): data is PublishCircuitModuleApplicationMissingBoardData {
  return (
    isObjectRecord(data) &&
    data.reason === "missing_board_match" &&
    Array.isArray(data.missingBoards) &&
    data.missingBoards.every(isPublishMissingBoard)
  )
}

export function getCircuitModulePublishMissingBoards(errorOrResponse: unknown) {
  const value = errorOrResponse as any
  const candidates = [value, value?.data?.data, value?.data, value?.response?.data?.data, value?.response?.data]
  const data = candidates.find(isCircuitModulePublishMissingBoardData)
  return isCircuitModulePublishMissingBoardData(data) ? data.missingBoards : []
}

export function getCircuitModuleApplicationList(params: GetCircuitModuleApplicationsParams = {}) {
  return request<CircuitModuleApplicationListResponse>({
    url: "data/assistant/circuit-board-module-order/list",
    method: "get",
    params
  })
}

export function syncCircuitModuleApplicationList(items: CircuitModuleApplicationRelation[]) {
  return request<CircuitModuleApplicationSyncResponse>({
    url: "data/assistant/circuit-board-module-order/sync",
    method: "post",
    data: {
      list: items
    }
  })
}

export function ensureCircuitModuleProductionBoards(data: EnsureCircuitModuleProductionBoardsRequest) {
  return request<EnsureCircuitModuleProductionBoardsResponse>({
    url: "data/assistant/circuit-board-module-order/ensure-production-boards",
    method: "post",
    data,
    silentError: true
  })
}

export function getCircuitModuleBindingSnapshot(applicationNum: string) {
  return request<CircuitModuleBindingSnapshotResponse>({
    url: "data/commission-board-relation/snapshot",
    method: "get",
    params: { applicationNum }
  })
}

export function saveCircuitModuleBindingSnapshot(data: SaveCircuitModuleBindingSnapshotRequest) {
  return request<CircuitModuleBindingSnapshotResponse>({
    url: "data/commission-board-relation/snapshot/save",
    method: "post",
    data,
    silentError: true
  })
}

export function retryCircuitModuleBindingSnapshot(applicationNum: string) {
  return request<CircuitModuleBindingSnapshotResponse>({
    url: "data/commission-board-relation/snapshot/retry",
    method: "post",
    data: { applicationNum },
    silentError: true
  })
}
