import { request } from "@/utils/service"
import type * as SimulatedWell from "./types"

/** 获取模拟井工单列表 */
export function getSimulatedWellOrderListApi(params: SimulatedWell.SimulatedWellOrderListRequest) {
  return request<SimulatedWell.SimulatedWellOrderListResponse>({
    url: "test/simulated-well/order/list/",
    method: "get",
    params
  })
}

/** 创建模拟井工单 */
export function createSimulatedWellOrderApi(data: SimulatedWell.CreateSimulatedWellOrderRequest) {
  return request<any>({
    url: "test/simulated-well/order/create/",
    method: "post",
    data
  })
}

/** 获取模拟井工单详情 */
export function getSimulatedWellOrderDetailApi(id: number) {
  return request<SimulatedWell.SimulatedWellOrderDetail>({
    url: `test/simulated-well/order/detail/${id}/`,
    method: "get"
  })
}

/** 删除模拟井工单 */
export function deleteSimulatedWellOrderApi(id: number) {
  return request<any>({
    url: `test/simulated-well/order/delete/${id}/`,
    method: "delete"
  })
}

/** 发布模拟井工单 */
export function publishSimulatedWellOrderApi(id: number) {
  return request<any>({
    url: `test/simulated-well/order/publish/${id}/`,
    method: "post"
  })
}

// 别名导出以保持一致性
export function getSimulatedWellOrderList(params: any) {
  return getSimulatedWellOrderListApi(params)
}

export function createSimulatedWellOrder(data: any) {
  return createSimulatedWellOrderApi(data)
}

export function getSimulatedWellOrderDetail(id: number) {
  return getSimulatedWellOrderDetailApi(id)
}

export function deleteSimulatedWellOrder(id: number) {
  return deleteSimulatedWellOrderApi(id)
}

export function publishSimulatedWellOrder(id: number) {
  return publishSimulatedWellOrderApi(id)
}
