import { request } from "@/utils/service"

export type WorkOrderScheduleEquipment =
  | "water-cycle"
  | "vibration-table"
  | "high-temp-box"
  | "high-temp-pressure"
  | "simulated-well"
  | "halt-hass"
  | "circuit-board-module"

export type ScheduleTargetKind = "order" | "instrument" | "device"
export type EndpointScheduleEquipment = WorkOrderScheduleEquipment

export type WorkOrderScheduleSegment = {
  scheduled_start_at?: string
  scheduled_end_at?: string
  sequence_only?: boolean
  sequence_order?: number
}

export type WorkOrderSchedulePayload = {
  scheduled_start_at?: string
  scheduled_end_at?: string
  schedule_segments?: WorkOrderScheduleSegment[]
  sequence_only?: boolean
  sequence_order?: number
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
