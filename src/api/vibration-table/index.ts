import { request } from "@/utils/service"
import type { VibrationTableOrderDetail, VibrationTableOrderListItem } from "./types"

type SnakeOrder = {
  id: number
  order_no?: string
  order_type?: string
  applicant?: string
  device_name?: string
  level?: string
  duration?: number
  status?: number
  status_text?: string
  test_date?: string | null
  remark?: string
  created_at?: string
  updated_at?: string
}

function formatDate(date: unknown) {
  if (date instanceof Date) return date.toISOString().split("T")[0]
  if (typeof date === "string") return date
  return ""
}

function toListItem(order: SnakeOrder): VibrationTableOrderListItem {
  return {
    id: order.id,
    orderNo: order.order_no || "",
    type: order.order_type || "",
    applicant: order.applicant || "",
    deviceName: order.device_name || "",
    level: order.level || "",
    duration: order.duration ?? 0,
    status: order.status ?? 0,
    statusText: order.status_text,
    testDate: order.test_date || undefined,
    remark: order.remark
  }
}

function toDetail(order: SnakeOrder): VibrationTableOrderDetail {
  return {
    ...toListItem(order),
    createdAt: order.created_at,
    updatedAt: order.updated_at
  }
}

export function getVibrationTableOrderList(params: any) {
  return request<any>({
    url: "test/vibration-table/order/list/",
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

export function getVibrationTableOrderDetail(id: number) {
  return request<any>({
    url: `test/vibration-table/order/detail/${id}/`,
    method: "get"
  }).then((res) => {
    if (res?.code !== 0) return res
    return {
      ...res,
      data: toDetail(res.data as SnakeOrder)
    }
  })
}

export function createVibrationTableOrder(data: any) {
  const payload = {
    order_no: data.orderNo,
    order_type: data.type,
    applicant: data.applicant,
    device_name: data.deviceName,
    level: data.level,
    duration: Number(data.duration || 0),
    test_date: data.testDate ? formatDate(data.testDate) : null,
    remark: data.remark || ""
  }
  return request<any>({
    url: "test/vibration-table/order/create/",
    method: "post",
    data: payload
  })
}

export function updateVibrationTableOrder(id: number, data: any) {
  const payload: any = {}
  if (data.orderNo !== undefined) payload.order_no = data.orderNo
  if (data.type !== undefined) payload.order_type = data.type
  if (data.applicant !== undefined) payload.applicant = data.applicant
  if (data.deviceName !== undefined) payload.device_name = data.deviceName
  if (data.level !== undefined) payload.level = data.level
  if (data.duration !== undefined) payload.duration = Number(data.duration || 0)
  if (data.testDate !== undefined) payload.test_date = data.testDate ? formatDate(data.testDate) : null
  if (data.remark !== undefined) payload.remark = data.remark || ""
  if (data.status !== undefined) payload.status = data.status

  return request<any>({
    url: `test/vibration-table/order/detail/${id}/`,
    method: "put",
    data: payload
  })
}

export function publishVibrationTableOrder(id: number) {
  return request<any>({
    url: `test/vibration-table/order/publish/${id}/`,
    method: "post"
  })
}

export function deleteVibrationTableOrder(id: number) {
  return request<any>({
    url: `test/vibration-table/order/delete/${id}/`,
    method: "delete"
  })
}
