import { request } from "@/utils/service"
import type * as CheckItem from "./types/check-item"

// FirstLevelDirectory

/** 查 */
export function getFirstLevelDirectoryApi() {
  return request<CheckItem.GetFirstLevelDirectoryResponseData>({
    url: "data/check-item-first-level-directory/list",
    method: "get"
  })
}

export function createFirstLevelDirectoryApi(data: { name: string }) {
  return request({
    url: "data/check-item-first-level-directory/add",
    method: "post",
    data
  })
}

// SecondLevelDirectory

export function createSecondLevelDirectoryApi(data: CheckItem.CreateSecondLevelDirectoryRequestData) {
  return request({
    url: "data/check-item-second-level-directory/add",
    method: "post",
    data
  })
}

// Directory

/** 查 */
export function getDirectoryApi() {
  return request<CheckItem.GetDirectoryResponseData>({
    url: "data/check-item-directory/list",
    method: "get"
  })
}

// 检测项

/** 查 */
export function getCheckItemApi(params: CheckItem.GetCheckItemRequestData) {
  return request<CheckItem.GetCheckItemResponseData>({
    url: "data/check-item/list",
    method: "get",
    params
  })
}

export function createCheckItemApi(data: CheckItem.CreateCheckItemRequestData) {
  return request({
    url: "data/check-item/add",
    method: "post",
    data
  })
}

/** 改 */
export function updateCheckItemApi(data: CheckItem.UpdateCheckItemRequestData) {
  return request({
    url: "data/check-item/update",
    method: "post",
    data
  })
}
