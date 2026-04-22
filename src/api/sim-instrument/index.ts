import { request } from "@/utils/service"
import type * as SimInstrument from "./types"

export function getSimInstrumentListApi(params: SimInstrument.SimInstrumentListRequest) {
  return request<SimInstrument.SimInstrumentListResponse>({
    url: "data/sim-instrument/list",
    method: "get",
    params
  })
}

export function createSimInstrumentApi(data: SimInstrument.CreateSimInstrumentRequest) {
  return request({
    url: "data/sim-instrument/create",
    method: "post",
    data
  })
}

export function updateSimInstrumentApi(instrumentId: number, data: SimInstrument.UpdateSimInstrumentRequest) {
  return request({
    url: `data/sim-instrument/update/${instrumentId}/`,
    method: "post",
    data
  })
}

export function deleteSimInstrumentApi(instrumentId: number) {
  return request({
    url: `data/sim-instrument/delete/${instrumentId}/`,
    method: "delete"
  })
}

