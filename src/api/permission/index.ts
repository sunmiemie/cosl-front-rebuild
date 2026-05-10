import { request } from "@/utils/service"
import type * as Permission from "@/api/permission/types/permission"

export function getPermissionDataApi() {
  return request<Permission.GetPermissionResponseData>({
    url: "data/permission/list",
    method: "get"
  })
}

export function createPermissionDataApi(data: Permission.SavePermissionRequestData) {
  return request<ApiResponseData<Permission.GetPermissionData>>({
    url: "data/permission/add",
    method: "post",
    data
  })
}

export function updatePermissionDataApi(data: Permission.SavePermissionRequestData) {
  return request<ApiResponseData<Permission.GetPermissionData>>({
    url: "data/permission/update",
    method: "post",
    data
  })
}

export function deletePermissionDataApi(permissionId: number) {
  return request({
    url: `data/permission/delete/${permissionId}`,
    method: "delete"
  })
}
