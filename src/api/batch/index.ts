import { request } from "@/utils/service"
import type * as Batch from "./types/batch"

export function createBatchDataApi(data: any) {
  return request({
    url: "equipment/batch/add",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}

/** 删 */
export function deleteBatchDataApi(id: string) {
  return request({
    url: `equipment/batch/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateBatchDataApi(data: Batch.UpdateBatchRequestData) {
  return request({
    url: "equipment/batch/update",
    method: "put",
    data
  })
}

/** 查 */
export function getBatchDataApi(params: Batch.GetBatchRequestData) {
  return request<Batch.GetBatchResponseData>({
    url: "equipment/batch/list",
    method: "get",
    params
  })
}
