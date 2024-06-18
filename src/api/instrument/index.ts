import { request } from "@/utils/service"
import type * as Instrument from "./types/instrument"
import {UnwrapNestedRefs} from "vue";

// 仪器管理

export function createInstrumentDataApi(data: UnwrapNestedRefs<{ name: string; id: null; type: null }>) {
  return request({
    url: "equipment/instrument/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteInstrumentDataApi(id: string) {
  return request({
    url: `equipment/instrument/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateInstrumentDataApi(data: { name: string; id: null; type: null }) {
  return request({
    url: "equipment/instrument/update",
    method: "post",
    data
  })
}

/** 查 */
export function getInstrumentDataApi(params: Instrument.GetInstrumentRequestData) {
  return request<Instrument.GetInstrumentResponseData>({
    url: "equipment/instrument/list",
    method: "get",
    params
  })
}
