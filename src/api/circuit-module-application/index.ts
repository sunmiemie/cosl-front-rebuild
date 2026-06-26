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
  sscp?: string
  ypmc?: string
  wlh?: string
  ggxh?: string
  gysmc?: string
  pch?: string
  sl?: string | number
  sn?: string
  wtr?: string
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
}

export interface DlbCircuitApplicationRaw {
  id?: string | number
  djbh?: string
  wtdw?: string
  kybh?: string
  xmysbh?: string
  xmmc?: string
  address?: string
  sqrq?: string
  sqrmc?: string
  sqrdh?: string
  zj?: string
  ssdw?: string
  ssdwqt?: string
  sfxyjcgy?: string
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
  seria?: string
  sn?: string
  serial?: string
  name?: string
  model?: string
  status?: string | number
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
  sqrq?: string
  sqrmc?: string
  sqrdh?: string
  zj?: string
  ssdw?: string
  ssdwqt?: string
  sfxyjcgy?: string
  ggxh?: string
  sl?: string | number
  sccj?: string
  bsh?: string
  zt?: string | number
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

export function isCircuitModulePublishMissingBoardData(
  data: unknown
): data is PublishCircuitModuleApplicationMissingBoardData {
  return isObjectRecord(data) && data.reason === "missing_board_match" && Array.isArray(data.missingBoards)
}

export function getCircuitModulePublishResponseData(
  errorOrResponse: unknown
): PublishCircuitModuleApplicationData | undefined {
  const value = errorOrResponse as any
  const candidates = [value?.data, value?.response?.data?.data, value?.response?.data]
  return candidates.find((candidate) => {
    if (isCircuitModulePublishMissingBoardData(candidate)) return true
    return (
      isObjectRecord(candidate) &&
      (candidate.orderType === "production" || candidate.orderType === "temporary") &&
      typeof candidate.generatedCount === "number" &&
      Array.isArray(candidate.generatedOrders)
    )
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
