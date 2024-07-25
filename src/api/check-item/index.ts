import {request} from "@/utils/service";
import type * as CheckItem from "./types/check-item"

/** 查 */
export function getDirectoryApi(params: CheckItem.GetDirectoryRequestData) {
  return request<CheckItem.GetDirectoryResponseData>({
    url: "data/directory/list",
    method: "get",
    params
  })
}

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
