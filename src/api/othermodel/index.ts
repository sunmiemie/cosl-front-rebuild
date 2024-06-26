import { request } from "@/utils/service"
import type * as Equipment from "@/api/othermodel/types/other"

export function createOtherDataApi(data: Equipment.CreateEquipmentRequestData) {
  return request({
    url: "equipment/otherequipment/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteOtherModelDataApi(id: string) {
  return request({
    url: `equipment/otherequipment/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateOtherModelDataApi(data: { name: string; id: null; seria: string; type: string }) {
  return request({
    url: "equipment/otherequipment/update",
    method: "post",
    data
  })
}

/** 查 */
export function getOtherModelDataApi(params: {
  size: number;
  name: string | undefined;
  currentPage: number;
  seria: string | undefined;
  type: string | undefined
}) {
  return request<Equipment.GetEquipmentResponseData>({
    url: "equipment/otherequipment/list",
    method: "get",
    params
  })
}
