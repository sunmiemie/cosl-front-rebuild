import { request } from "@/utils/service"
import type * as InspectionBase from "./types"

export function getInspectionUserOptionsApi() {
  return request<InspectionBase.InspectionUserOptionsResponse>({
    url: "data/inspection-base/user-options",
    method: "get"
  })
}

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

export function saveInspectionBaseItemApi(data: InspectionBase.InspectionBaseItemSaveRequest) {
  return request<InspectionBase.InspectionBaseItemSaveResponse>({
    url: "data/inspection-base/item/save",
    method: "post",
    data
  })
}

export function deleteInspectionBaseItemApi(itemId: number) {
  return request<InspectionBase.InspectionBaseItemDeleteResponse>({
    url: `data/inspection-base/item/delete/${itemId}/`,
    method: "delete"
  })
}

export function deleteInspectionBaseInfoApi(baseId: number) {
  return request({
    url: `data/inspection-base/delete/${baseId}/`,
    method: "delete"
  })
}

export function syncInspectionBaseToAssistantApi(
  baseId: number,
  data: InspectionBase.InspectionBaseAssistantSyncRequest
) {
  return request<InspectionBase.InspectionBaseAssistantSyncResponse>({
    url: `data/inspection-base/sync-assistant/${baseId}/`,
    method: "post",
    data
  })
}

export function getAssistantInspectionResultsApi(params?: Record<string, string>) {
  return request<InspectionBase.AssistantInspectionResultsResponse>({
    url: "external/assistant/inspection/results/",
    method: "get",
    params
  })
}
