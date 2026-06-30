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
  sscp?: string
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
  scheduled_start_at: string
  scheduled_end_at: string
}

export interface CircuitModuleBoardItem {
  id?: string | number
  board_id?: string | number
  boardId?: string | number
  prodBoardId?: string | number
  prod_board_id?: string | number
  tempBoardId?: string | number
  temp_board_id?: string | number
  seria?: string
  sn?: string
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
  }
}

export interface PublishCircuitModuleApplicationRequest {
  applicationId: string | number
  orderNo: string
}

export interface PublishCircuitModuleMissingBoard {
  sn: string
  pch: string
  gysmc: string
  ggxh: string
}

export interface PublishCircuitModuleGeneratedOrder {
  id: string | number
  name: string
  boardSn: string
  boardBatchNo: string
}

export interface PublishCircuitModuleApplicationSuccessData {
  status: string | number
  orderType: CircuitModuleGeneratedOrderType
  generatedCount: number
  generatedOrders: PublishCircuitModuleGeneratedOrder[]
  reason?: never
  missingBoards?: never
}

export interface PublishCircuitModuleApplicationMissingBoardData {
  reason: "missing_board_match"
  missingBoards: PublishCircuitModuleMissingBoard[]
  status?: string | number
  orderType?: CircuitModuleGeneratedOrderType
  generatedCount?: number
  generatedOrders?: never
}

export type PublishCircuitModuleApplicationData =
  | PublishCircuitModuleApplicationSuccessData
  | PublishCircuitModuleApplicationMissingBoardData

export interface PublishCircuitModuleApplicationResponse {
  code: number
  msg?: string
  data?: PublishCircuitModuleApplicationData
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object"
}

function isStringValue(value: unknown): value is string {
  return typeof value === "string"
}

function isStringOrNumberValue(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number"
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

function isPublishGeneratedOrder(value: unknown): value is PublishCircuitModuleGeneratedOrder {
  return (
    isObjectRecord(value) &&
    isStringOrNumberValue(value.id) &&
    isStringValue(value.name) &&
    isStringValue(value.boardSn) &&
    isStringValue(value.boardBatchNo)
  )
}

export function isCircuitModulePublishSuccessData(
  data: unknown
): data is PublishCircuitModuleApplicationSuccessData {
  return (
    isObjectRecord(data) &&
    isStringOrNumberValue(data.status) &&
    (data.orderType === "production" || data.orderType === "temporary") &&
    typeof data.generatedCount === "number" &&
    Array.isArray(data.generatedOrders) &&
    data.generatedOrders.every(isPublishGeneratedOrder)
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

export function getCircuitModulePublishResponseData(
  errorOrResponse: unknown
): PublishCircuitModuleApplicationData | undefined {
  const value = errorOrResponse as any
  const candidates = [value, value?.data?.data, value?.data, value?.response?.data?.data, value?.response?.data]
  return candidates.find((candidate) => {
    if (isCircuitModulePublishMissingBoardData(candidate)) return true
    return isCircuitModulePublishSuccessData(candidate)
  }) as PublishCircuitModuleApplicationData | undefined
}

export function getCircuitModulePublishMissingBoards(errorOrResponse: unknown) {
  const data = getCircuitModulePublishResponseData(errorOrResponse)
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

export function publishCircuitModuleApplicationAndGenerateOrders(data: PublishCircuitModuleApplicationRequest) {
  return request<PublishCircuitModuleApplicationResponse>({
    url: "data/assistant/circuit-board-module-order/publish-generate",
    method: "post",
    data
  })
}
