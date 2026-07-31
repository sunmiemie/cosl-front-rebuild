import { request } from "@/utils/service"
import type {
  ApiCalibrationWorkOrder,
  OrderListRequest,
  OrderListResponse,
  OrderMutationResponse
} from "./types"

export function getCalibrationOrderListApi(params: OrderListRequest) {
  return request<OrderListResponse>({
    url: "test/calibration-well/order/list/",
    method: "get",
    params
  })
}

export function getCalibrationOrderDetailApi(id: number) {
  return request<{ code: number; data: ApiCalibrationWorkOrder }>({
    url: `test/calibration-well/order/detail/${id}/`,
    method: "get"
  })
}

export function createCalibrationOrderApi(data: Record<string, unknown>) {
  return request<OrderMutationResponse>({
    url: "test/calibration-well/order/create/",
    method: "post",
    data
  })
}

export function updateCalibrationOrderApi(id: number, data: Record<string, unknown>) {
  return request<OrderMutationResponse>({
    url: `test/calibration-well/order/update/${id}/`,
    method: "post",
    data
  })
}

export function deleteCalibrationOrderApi(id: number) {
  return request<OrderMutationResponse>({
    url: `test/calibration-well/order/delete/${id}/`,
    method: "post"
  })
}

export function publishCalibrationOrderApi(id: number) {
  return request<OrderMutationResponse>({
    url: `test/calibration-well/order/publish/${id}/`,
    method: "post"
  })
}

export function changeCalibrationOrderStatusApi(id: number, status: number) {
  return request<OrderMutationResponse>({
    url: `test/calibration-well/order/status/${id}/`,
    method: "post",
    data: { status }
  })
}
