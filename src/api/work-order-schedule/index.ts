import { request } from "@/utils/service"

export type WorkOrderScheduleEquipment =
  | "water-cycle"
  | "vibration-table"
  | "high-temp-box"
  | "high-temp-pressure"
  | "simulated-well"

export type ScheduleTargetKind = "order" | "instrument" | "device"

export type WorkOrderScheduleSegment = {
  scheduled_start_at: string
  scheduled_end_at: string
}

export type WorkOrderSchedulePayload = {
  scheduled_start_at: string
  scheduled_end_at: string
  schedule_segments?: WorkOrderScheduleSegment[]
}

type ScheduleEndpointConfig = {
  targetKind: ScheduleTargetKind
  baseUrl: string
}

const scheduleEndpointMap: Record<WorkOrderScheduleEquipment, ScheduleEndpointConfig> = {
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
  }
}

const buildScheduleUrl = (equipment: WorkOrderScheduleEquipment, targetId: number) => {
  const config = scheduleEndpointMap[equipment]
  return `${config.baseUrl}${targetId}/`
}

export function getScheduleTargetKind(equipment: WorkOrderScheduleEquipment) {
  return scheduleEndpointMap[equipment].targetKind
}

export function saveWorkOrderSchedule(
  equipment: WorkOrderScheduleEquipment,
  targetId: number,
  data: WorkOrderSchedulePayload
) {
  return request<any>({
    url: buildScheduleUrl(equipment, targetId),
    method: "post",
    data
  })
}

export function clearWorkOrderSchedule(equipment: WorkOrderScheduleEquipment, targetId: number) {
  return request<any>({
    url: buildScheduleUrl(equipment, targetId),
    method: "delete"
  })
}
