import { request } from "@/utils/service"
import type * as DefectItem from "./types/defect-item"

// FirstLevelDirectory

/** 查 */
export function getFirstLevelDirectoryApi(params: DefectItem.GetFirstLevelDirectoryRequestData) {
  return request<DefectItem.GetFirstLevelDirectoryResponseData>({
    url: "data/defect-item-first-level-directory/list",
    method: "get",
    params
  })
}

export function createFirstLevelDirectoryApi(data: DefectItem.CreateFirstLevelDirectoryRequestData) {
  return request({
    url: "data/defect-item-first-level-directory/add",
    method: "post",
    data
  })
}

// SecondLevelDirectory

export function createSecondLevelDirectoryApi(data: DefectItem.CreateSecondLevelDirectoryRequestData) {
  return request({
    url: "data/defect-item-second-level-directory/add",
    method: "post",
    data
  })
}

// Directory

/** 查 */
export function getDirectoryApi(params: DefectItem.GetDirectoryRequestData) {
  return request<DefectItem.GetDirectoryResponseData>({
    url: "data/defect-item-directory/list",
    method: "get",
    params
  })
}

// DefectItem

/** 查 */
export function getDefectItemApi(params: DefectItem.GetDefectItemRequestData) {
  return request<DefectItem.GetDefectItemResponseData>({
    url: "data/defect-item/list",
    method: "get",
    params
  })
}

export function createDefectItemApi(data: DefectItem.CreateDefectItemRequestData) {
  return request({
    url: "data/defect-item/add",
    method: "post",
    data
  })
}

/** 改 */
export function updateDefectItemApi(data: DefectItem.UpdateDefectItemRequestData) {
  return request({
    url: "data/defect-item/update",
    method: "post",
    data
  })
}
