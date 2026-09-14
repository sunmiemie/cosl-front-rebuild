import { request } from "@/utils/service"

export type WorkOrderScheduleEquipment =
  | "water-cycle"
  | "vibration-table"
  | "high-temp-box"
  | "high-temp-pressure"
  | "simulated-well"
  | "halt-hass"
  | "circuit-board-module"
  | "sensorless-oven"

export type ScheduleTargetKind = "order" | "instrument" | "device"
export type EndpointScheduleEquipment = WorkOrderScheduleEquipment

export type WorkOrderScheduleSegment = {
  scheduled_start_at?: string
  scheduled_end_at?: string
  equipment_id?: string
  equipmentId?: string
  use_device?: string
  useDevice?: string
  sequence_only?: boolean
  sequence_order?: number
  skip_assistant_push?: boolean
  skipAssistantPush?: boolean
}

export type WorkOrderSchedulePayload = {
  scheduled_start_at?: string
  scheduled_end_at?: string
  schedule_segments?: WorkOrderScheduleSegment[]
  equipment_id?: string
  equipmentId?: string
  use_device?: string
  useDevice?: string
  sequence_only?: boolean
  sequence_order?: number
  skip_assistant_push?: boolean
  skipAssistantPush?: boolean
}

export type WorkOrderScheduleHistoryItem = {
  id: number
  equipmentType: WorkOrderScheduleEquipment
  targetKind: ScheduleTargetKind
  orderId: string
  targetId: string
  taskNumber: string
  orderTitle: string
  targetName: string
  applicant: string
  status: string
  statusText: string
  scheduledStartAt: string
  scheduledEndAt: string
  scheduleSegments: WorkOrderScheduleSegment[]
  archivedAt: string
}

export type WorkOrderScheduleHistoryResponse = {
  code: number
  msg?: string
  data: {
    list: WorkOrderScheduleHistoryItem[]
    total: number
  }
}

export type CircuitBoardSequenceBatchPayload = {
  order_ids: number[]
  equipment_id?: string
  equipmentId?: string
  use_device?: string
  useDevice?: string
}

export type CircuitBoardAssistantPushResult = {
  success: boolean
  skipped?: boolean
  reason?: string
  error?: string
}

export type CircuitBoardSequenceBatchItem = {
  orderId: number
  sequenceOrder: number
  assistantPush?: CircuitBoardAssistantPushResult | null
}

export type CircuitBoardSequenceBatchResponse = {
  code: number
  msg?: string
  data: {
    list: CircuitBoardSequenceBatchItem[]
    summary?: {
      total: number
      success: number
      failed: number
      skipped: number
    }
  }
}

type ScheduleEndpointConfig = {
  targetKind: ScheduleTargetKind
  baseUrl: string
}

const scheduleEndpointMap: Record<EndpointScheduleEquipment, ScheduleEndpointConfig> = {
  "water-cycle": {
    targetKind: "order",
    baseUrl: "test/water-cycle/order/schedule/"
  },
  "vibration-table": {
    targetKind: "order",
    baseUrl: "test/vibration-table/order/schedule/"
  },
  "high-temp-box": {
    targetKind: "order",
    baseUrl: "test/high-temp-box/order/schedule/"
  },
  "high-temp-pressure": {
    targetKind: "instrument",
    baseUrl: "test/high-temp-pressure/order/instrument-schedule/"
  },
  "simulated-well": {
    targetKind: "device",
    baseUrl: "test/simulated-well/order/device-schedule/"
  },
  "halt-hass": {
    targetKind: "order",
    baseUrl: "test/halt-hass/order/schedule/"
  },
  "circuit-board-module": {
    targetKind: "order",
    baseUrl: "test/circuit-board-module/order/schedule/"
  },
  "sensorless-oven": {
    targetKind: "order",
    baseUrl: "test/sensorless-oven/order/schedule/"
  }
}

const buildScheduleUrl = (equipment: EndpointScheduleEquipment, targetId: number) => {
  const config = scheduleEndpointMap[equipment]
  return `${config.baseUrl}${targetId}/`
}

export function getScheduleTargetKind(equipment: WorkOrderScheduleEquipment) {
  if (equipment === "circuit-board-module") return "order"
  return scheduleEndpointMap[equipment].targetKind
}

export function saveWorkOrderSchedule(
  equipment: EndpointScheduleEquipment,
  targetId: number,
  data: WorkOrderSchedulePayload
) {
  return request<any>({
    url: buildScheduleUrl(equipment, targetId),
    method: "post",
    data
  })
}

export function clearWorkOrderSchedule(equipment: EndpointScheduleEquipment, targetId: number) {
  return request<any>({
    url: buildScheduleUrl(equipment, targetId),
    method: "delete"
  })
}

export function getWorkOrderScheduleHistory(params: {
  equipmentType: Exclude<WorkOrderScheduleEquipment, "circuit-board-module">
  startDate: string
  endDate: string
}) {
  return request<WorkOrderScheduleHistoryResponse>({
    url: "test/work-order-schedule/history/",
    method: "get",
    params
  })
}

export function saveCircuitBoardSequenceBatch(data: CircuitBoardSequenceBatchPayload) {
  return request<CircuitBoardSequenceBatchResponse>({
    url: "test/circuit-board-module/order/sequence/",
    method: "post",
    data
  })
}
