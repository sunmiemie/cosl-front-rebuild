import { request } from "@/utils/service"

export function getWaterCycleOrderListApi(params: any) {
  return request<any>({
    url: "test/water-cycle/order/list/",
    method: "get",
    params
  })
}

export function createWaterCycleOrderApi(data: any) {
  return request<any>({
    url: "test/water-cycle/order/create/",
    method: "post",
    data
  })
}

export function getWaterCycleOrderDetailApi(id: number) {
  return request<any>({
    url: `test/water-cycle/order/detail/${id}/`,
    method: "get"
  })
}

export function updateWaterCycleOrderApi(id: number, data: any) {
  return request<any>({
    url: `test/water-cycle/order/detail/${id}/`,
    method: "put",
    data
  })
}

export function deleteWaterCycleOrderApi(id: number) {
  return request<any>({
    url: `test/water-cycle/order/delete/${id}/`,
    method: "delete"
  })
}

export function publishWaterCycleOrderApi(id: number) {
  return request<any>({
    url: `test/water-cycle/order/publish/${id}/`,
    method: "post"
  })
}

export function getWaterCycleOrderList(params: any) {
  return getWaterCycleOrderListApi(params)
}

export function createWaterCycleOrder(data: any) {
  return createWaterCycleOrderApi(data)
}

export function getWaterCycleOrderDetail(id: number) {
  return getWaterCycleOrderDetailApi(id)
}

export function updateWaterCycleOrder(id: number, data: any) {
  return updateWaterCycleOrderApi(id, data)
}

export function deleteWaterCycleOrder(id: number) {
  return deleteWaterCycleOrderApi(id)
}

export function publishWaterCycleOrder(id: number) {
  return publishWaterCycleOrderApi(id)
}
