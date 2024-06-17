import { request } from "@/utils/service"
import type * as EquipmentType from "./types/equipmentType"

export function createEquipmentTypeDataApi(data: EquipmentType.CreateEquipmentTypeRequestData) {
  return request({
    url: "equipment/otherequipmentmodel/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteEquipmentTypeDataApi(id: string) {
  return request({
    url: `equipment/otherequipmentmodel/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateEquipmentTypeDataApi(data: EquipmentType.UpdateEquipmentTypeRequestData) {
  return request({
    url: "equipment/otherequipmentmodel/update",
    method: "post",
    data
  })
}

// /** 查 */  其他设备型号
export function getEquipmentTypeDataApi(params: EquipmentType.GetEquipmentTypeRequestData) {
  return request<EquipmentType.GetEquipmentTypeResponseData>({
    url: "equipment/otherequipmentmodel/list",
    method: "get",
    params
  })
}
