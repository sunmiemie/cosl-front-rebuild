import { request } from "@/utils/service"
import type {
  ApiCalibrationWell,
  WellListRequest,
  WellListResponse,
  WellMutationResponse,
  WellOptionsResponse
} from "./types"

export function getCalibrationWellListApi(params: WellListRequest) {
  return request<WellListResponse>({
    url: "test/calibration-well/well/list/",
    method: "get",
    params
  })
}

export function getCalibrationWellDetailApi(id: number) {
  return request<{ code: number; data: ApiCalibrationWell }>({
    url: `test/calibration-well/well/detail/${id}/`,
    method: "get"
  })
}

export function getCalibrationWellOptionsApi(wellType?: string) {
  return request<WellOptionsResponse>({
    url: "test/calibration-well/well/options/",
    method: "get",
    params: wellType ? { wellType } : undefined
  })
}

export function createCalibrationWellApi(data: Record<string, unknown>) {
  return request<WellMutationResponse>({
    url: "test/calibration-well/well/create/",
    method: "post",
    data
  })
}

export function updateCalibrationWellApi(id: number, data: Record<string, unknown>) {
  return request<WellMutationResponse>({
    url: `test/calibration-well/well/update/${id}/`,
    method: "post",
    data
  })
}

export function deleteCalibrationWellApi(id: number) {
  return request<WellMutationResponse>({
    url: `test/calibration-well/well/delete/${id}/`,
    method: "post"
  })
}
