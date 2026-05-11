import { request } from "@/utils/service"
import type { SignatureDetailResponse, SignatureListRequest, SignatureListResponse } from "./types"

export function getMySignatureApi() {
  return request<SignatureDetailResponse>({
    url: "data/signature/me",
    method: "get"
  })
}

export function uploadMySignatureApi(data: FormData) {
  return request<SignatureDetailResponse>({
    url: "data/signature/me",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}

export function deleteMySignatureApi() {
  return request<SignatureDetailResponse>({
    url: "data/signature/me",
    method: "delete"
  })
}

export function getSignatureListApi(params: SignatureListRequest) {
  return request<SignatureListResponse>({
    url: "data/signature/list",
    method: "get",
    params
  })
}

export function getUserSignatureApi(userId: number) {
  return request<SignatureDetailResponse>({
    url: `data/signature/users/${userId}`,
    method: "get"
  })
}

export function uploadUserSignatureApi(userId: number, data: FormData) {
  return request<SignatureDetailResponse>({
    url: `data/signature/users/${userId}`,
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}

export function deleteUserSignatureApi(userId: number) {
  return request<SignatureDetailResponse>({
    url: `data/signature/users/${userId}`,
    method: "delete"
  })
}

export function getSignatureImageApi(userId: number) {
  return request<Blob>({
    url: `data/signature/users/${userId}/image`,
    method: "get",
    responseType: "blob"
  })
}
