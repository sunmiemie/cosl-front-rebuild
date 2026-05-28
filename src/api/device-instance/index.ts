import { request } from "@/utils/service"
import type {
  DeviceInstanceListResponse,
  DeviceInstancePayload,
  DeviceInstanceQuery,
  DeviceInstanceStatsResponse
} from "./types"

const baseUrl = "equipment/device-instance"

export function getDeviceInstanceListApi(params: DeviceInstanceQuery) {
  return request<DeviceInstanceListResponse>({
    url: `${baseUrl}/list`,
    method: "get",
    params
  })
}

export function getDeviceInstanceStatsApi() {
  return request<DeviceInstanceStatsResponse>({
    url: `${baseUrl}/stats`,
    method: "get"
  })
}

export function createDeviceInstanceApi(data: DeviceInstancePayload) {
  return request({
    url: `${baseUrl}/add`,
    method: "post",
    data
  })
}

export function updateDeviceInstanceApi(data: DeviceInstancePayload) {
  return request({
    url: `${baseUrl}/update`,
    method: "post",
    data
  })
}

export function deleteDeviceInstanceApi(id: string | number) {
  return request({
    url: `${baseUrl}/${id}`,
    method: "delete"
  })
}
