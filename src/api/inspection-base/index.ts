import { request } from "@/utils/service"
import type * as InspectionBase from "./types"

export function getInspectionBaseInfoListApi(params: InspectionBase.InspectionBaseInfoListRequest) {
  return request<InspectionBase.InspectionBaseInfoListResponse>({
    url: "data/inspection-base/list",
    method: "get",
    params
  })
}

export function getInspectionBaseInfoDetailApi(baseId: number) {
  return request<InspectionBase.InspectionBaseInfoDetailResponse>({
    url: `data/inspection-base/detail/${baseId}/`,
    method: "get"
  })
}

export function saveInspectionBaseInfoApi(data: InspectionBase.InspectionBaseInfoSaveRequest) {
  return request<InspectionBase.InspectionBaseInfoSaveResponse>({
    url: "data/inspection-base/save",
    method: "post",
    data
  })
}

export function deleteInspectionBaseInfoApi(baseId: number) {
  return request({
    url: `data/inspection-base/delete/${baseId}/`,
    method: "delete"
  })
}
