import { request } from "@/utils/service"

export function createTempBatchDataApi(data: any) {
  return request({
    url: "equipment/temp-batch/add",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}

export function previewTempBatchDataApi(data: any) {
  return request({
    url: "equipment/temp-batch/preview",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}
