import { request } from "@/utils/service"
import type * as Psi from "./types/psi"

export function createHostModelDataApi(data: Psi.CreatePsiRequestData) {
  return request({
    url: "equipment/psi/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteHostModelDataApi(id: string) {
  return request({
    url: `equipment/psi/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateHostModelDataApi(data: Psi.UpdatePsiRequestData) {
  return request({
    url: "equipment/psi/update",
    method: "post",
    data
  })
}

/** 查 */
export function getHostModelDataApi(params: Psi.GetPsiRequestData) {
  return request<Psi.GetPsiResponseData>({
    url: "equipment/psi/list",
    method: "get",
    params
  })
}
