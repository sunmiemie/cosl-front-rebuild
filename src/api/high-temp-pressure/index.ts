import { request } from "@/utils/service"
import type * as HighTempPressure from "./types"

type MutationResponse = {
  code: number
  msg?: string
}

/** 获取高温高压井工单列表 */
export function getHighTempPressureOrderListApi(params: HighTempPressure.HighTempPressureOrderListRequest) {
  return request<HighTempPressure.HighTempPressureOrderListResponse>({
    url: "test/high-temp-pressure/order/list/",
    method: "get",
    params
  })
}

/** 创建高温高压井工单 */
export function createHighTempPressureOrderApi(data: HighTempPressure.CreateHighTempPressureOrderRequest) {
  return request<MutationResponse>({
    url: "test/high-temp-pressure/order/create/",
    method: "post",
    data
  })
}

/** 获取高温高压井工单详情 */
export function getHighTempPressureOrderDetailApi(id: number) {
  return request<HighTempPressure.HighTempPressureOrderDetailResponse>({
    url: `test/high-temp-pressure/order/detail/${id}/`,
    method: "get"
  })
}

/** 删除高温高压井工单 */
export function deleteHighTempPressureOrderApi(id: number) {
  return request<MutationResponse>({
    url: `test/high-temp-pressure/order/delete/${id}/`,
    method: "delete"
  })
}

/** 发布高温高压井工单 */
export function publishHighTempPressureOrderApi(id: number, data?: FormData) {
  return request<MutationResponse>({
    url: `test/high-temp-pressure/order/publish/${id}/`,
    method: "post",
    ...(data
      ? {
          headers: { "Content-Type": "multipart/form-data" },
          data
        }
      : {})
  })
}

// 别名导出以保持一致性
export function getHighTempPressureOrderList(params: any) {
  return getHighTempPressureOrderListApi(params)
}

export function createHighTempPressureOrder(data: any) {
  return createHighTempPressureOrderApi(data)
}

export function getHighTempPressureOrderDetail(id: number) {
  return getHighTempPressureOrderDetailApi(id)
}

export function deleteHighTempPressureOrder(id: number) {
  return deleteHighTempPressureOrderApi(id)
}

export function publishHighTempPressureOrder(id: number, data?: FormData) {
  return publishHighTempPressureOrderApi(id, data)
}
