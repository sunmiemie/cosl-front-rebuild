import { request } from "@/utils/service"
import type {
  ApiCalibrationInstrumentModel,
  ModelListRequest,
  ModelListResponse,
  ModelMutationResponse,
  ModelOptionsResponse
} from "./types"

export function getCalibrationModelListApi(params: ModelListRequest) {
  return request<ModelListResponse>({
    url: "test/calibration-well/model/list/",
    method: "get",
    params
  })
}

export function getCalibrationModelDetailApi(id: number) {
  return request<{ code: number; data: ApiCalibrationInstrumentModel }>({
    url: `test/calibration-well/model/detail/${id}/`,
    method: "get"
  })
}

export function getCalibrationModelOptionsApi() {
  return request<ModelOptionsResponse>({
    url: "test/calibration-well/model/options/",
    method: "get"
  })
}

export function createCalibrationModelApi(data: Record<string, unknown>) {
  return request<ModelMutationResponse>({
    url: "test/calibration-well/model/create/",
    method: "post",
    data
  })
}

export function updateCalibrationModelApi(id: number, data: Record<string, unknown>) {
  return request<ModelMutationResponse>({
    url: `test/calibration-well/model/update/${id}/`,
    method: "post",
    data
  })
}

export function deleteCalibrationModelApi(id: number) {
  return request<ModelMutationResponse>({
    url: `test/calibration-well/model/delete/${id}/`,
    method: "post"
  })
}
