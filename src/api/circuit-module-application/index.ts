import { request } from "@/utils/service"

export interface GetCircuitModuleApplicationsParams {
  search?: string
  status?: string
  device?: string
  orderNo?: string
  commissionNo?: string
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
