import { request } from "@/utils/service"
import type { SensorlessOvenOrderDetail, SensorlessOvenOrderListItem } from "./types"

type SnakeOrder = {
  id: number
  task_number?: string
  applicant?: string
  test_application_unit?: string
  project_name?: string
  specification?: string
  max_temperature?: number | null
  instrument_name?: string
  sn_numbers?: string
  status?: number
  status_text?: string
  scheduled_start_at?: string | null
  scheduled_end_at?: string | null
  schedule_segments?: any[]
  created_at?: string
  updated_at?: string
}

function toListItem(order: SnakeOrder): SensorlessOvenOrderListItem {
  return {
    id: order.id,
    taskNumber: order.task_number || "",
    applicant: order.applicant || "",
    testApplicationUnit: order.test_application_unit || "",
    projectName: order.project_name || "",
    specification: order.specification || "",
    maxTemperature: order.max_temperature ?? "",
    status: order.status ?? 0,
    statusText: order.status_text,
    scheduledStartAt: order.scheduled_start_at ?? null,
    scheduledEndAt: order.scheduled_end_at ?? null,
    scheduleSegments: order.schedule_segments ?? []
  }
}

function toDetail(order: SnakeOrder): SensorlessOvenOrderDetail {
  return {
    ...toListItem(order),
    instrumentName: order.instrument_name || "",
    snNumbers: order.sn_numbers || "",
    createdAt: order.created_at,
    updatedAt: order.updated_at
  }
}

function toPayload(data: any) {
  return {
    applicant: data.applicant,
    test_application_unit: data.testApplicationUnit || "",
    project_name: data.projectName || "",
    specification: data.specification || "",
    max_temperature: data.maxTemperature === "" || data.maxTemperature == null ? null : Number(data.maxTemperature),
    instrument_name: data.instrumentName || "",
    sn_numbers: data.snNumbers || ""
  }
}

export function getSensorlessOvenOrderList(params: any) {
  return request<any>({
    url: "test/sensorless-oven/order/list/",
    method: "get",
    params
  }).then((res) => {
    if (res?.code !== 0) return res
    const list = (res.data?.list || []) as SnakeOrder[]
    return {
      ...res,
      data: {
        ...res.data,
        list: list.map(toListItem)
      }
    }
  })
}

export function getSensorlessOvenOrderDetail(id: number) {
  return request<any>({
    url: `test/sensorless-oven/order/detail/${id}/`,
    method: "get"
  }).then((res) => {
    if (res?.code !== 0) return res
    return {
      ...res,
      data: toDetail(res.data as SnakeOrder)
    }
  })
}

export function createSensorlessOvenOrder(data: any) {
  return request<any>({
    url: "test/sensorless-oven/order/create/",
    method: "post",
    data: toPayload(data)
  })
}

export function publishSensorlessOvenOrder(id: number) {
  return request<any>({
    url: `test/sensorless-oven/order/publish/${id}/`,
    method: "post"
  })
}

export function deleteSensorlessOvenOrder(id: number) {
  return request<any>({
    url: `test/sensorless-oven/order/delete/${id}/`,
    method: "delete"
  })
}
