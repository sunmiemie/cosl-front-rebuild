import { request } from "@/utils/service"
import type { HighTemperatureOrderDetail, HighTemperatureOrderListItem } from "./types"

type SnakeOrder = {
  id: number
  test_platform?: string
  test_date?: string
  run_time?: number
  device_name?: string
  device_number?: string
  task_number?: string
  target_temp?: number
  applicant?: string
  remark?: string
  feedback_reason?: string
  status?: number
  status_text?: string
  created_at?: string
  updated_at?: string
}

function formatDate(date: unknown) {
  if (date instanceof Date) return date.toISOString().split("T")[0]
  if (typeof date === "string") return date
  return ""
}

function toListItem(order: SnakeOrder): HighTemperatureOrderListItem {
  return {
    id: order.id,
    taskNumber: order.task_number || "",
    applicant: order.applicant || "",
    deviceName: order.device_name || "",
    targetTemp: order.target_temp ?? "",
    status: order.status ?? 0,
    statusText: order.status_text,
    testDate: order.test_date
  }
}

function toDetail(order: SnakeOrder): HighTemperatureOrderDetail {
  return {
    ...toListItem(order),
    testPlatform: order.test_platform,
    runTime: order.run_time,
    deviceNumber: order.device_number,
    remark: order.remark,
    feedbackReason: order.feedback_reason,
    createdAt: order.created_at,
    updatedAt: order.updated_at
  }
}

export function getHighTemperatureOrderList(params: any) {
  return request<any>({
    url: "test/high-temp-box/order/list/",
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

export function getHighTemperatureOrderDetail(id: number) {
  return request<any>({
    url: `test/high-temp-box/order/detail/${id}/`,
    method: "get"
  }).then((res) => {
    if (res?.code !== 0) return res
    return {
      ...res,
      data: toDetail(res.data as SnakeOrder)
    }
  })
}

export function createHighTemperatureOrder(data: any) {
  const payload = {
    test_platform: data.testPlatform,
    test_date: formatDate(data.testDate),
    run_time: Number(data.runTime || 0),
    device_name: data.deviceName,
    device_number: data.deviceNumber,
    task_number: data.taskNumber,
    target_temp: Number(data.targetTemp || 0),
    applicant: data.applicant,
    remark: data.remark || ""
  }

  return request<any>({
    url: "test/high-temp-box/order/create/",
    method: "post",
    data: payload
  })
}

export function updateHighTemperatureOrder(id: number, data: any) {
  const payload: any = {}
  if (data.testPlatform !== undefined) payload.test_platform = data.testPlatform
  if (data.testDate !== undefined) payload.test_date = formatDate(data.testDate)
  if (data.runTime !== undefined) payload.run_time = Number(data.runTime || 0)
  if (data.deviceName !== undefined) payload.device_name = data.deviceName
  if (data.deviceNumber !== undefined) payload.device_number = data.deviceNumber
  if (data.taskNumber !== undefined) payload.task_number = data.taskNumber
  if (data.targetTemp !== undefined) payload.target_temp = Number(data.targetTemp || 0)
  if (data.applicant !== undefined) payload.applicant = data.applicant
  if (data.remark !== undefined) payload.remark = data.remark || ""
  if (data.status !== undefined) payload.status = data.status

  return request<any>({
    url: `test/high-temp-box/order/detail/${id}/`,
    method: "put",
    data: payload
  })
}

export function publishHighTemperatureOrder(id: number) {
  return request<any>({
    url: `test/high-temp-box/order/publish/${id}/`,
    method: "post"
  })
}

export function deleteHighTemperatureOrder(id: number) {
  return request<any>({
    url: `test/high-temp-box/order/delete/${id}/`,
    method: "delete"
  })
}
