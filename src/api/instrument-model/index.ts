import { request } from "@/utils/service"
import type * as InstrumentModel from "./types"

export function getInstrumentModelListApi(params: InstrumentModel.InstrumentModelListRequest) {
  return request<InstrumentModel.InstrumentModelListResponse>({
    url: "data/instrument-model/list",
    method: "get",
    params
  })
}

export function createInstrumentModelApi(data: InstrumentModel.CreateInstrumentModelRequest) {
  return request({
    url: "data/instrument-model/create",
    method: "post",
    data
  })
}

export function updateInstrumentModelApi(modelId: number, data: InstrumentModel.UpdateInstrumentModelRequest) {
  return request({
    url: `data/instrument-model/update/${modelId}/`,
    method: "post",
    data
  })
}

export function deleteInstrumentModelApi(modelId: number) {
  return request({
    url: `data/instrument-model/delete/${modelId}/`,
    method: "delete"
  })
}
