import { request } from "@/utils/service"
import type * as TempBatch from "./types/temp-batch"

export function createTempBatchDataApi(data: any) {
  return request({
    url: "equipment/temp-batch/add",
    method: "post",
    data
  })
}

export function previewTempBatchDataApi(data: any) {
  return request<TempBatch.PreviewTempBatchResponseData>({
    url: "equipment/temp-batch/preview",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}

/** 查 */
export function getTempBatchDataApi(params: TempBatch.GetTempBatchRequestData) {
  return request<TempBatch.GetTempBatchResponseData>({
    url: "equipment/temp-batch/list",
    method: "get",
    params
  })
}

export function getNewestBatchNumber() {
  return request<TempBatch.NewestBatchNumberResponseData>({
    url: "equipment/temp-batch/newest-batch-number",
    method: "get"
  })
}
