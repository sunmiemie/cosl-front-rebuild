import type * as Role from "@/api/role/types/role"
import { request } from "@/utils/service"

export function createRoleDataApi(data: Role.CreateRoleRequestData) {
  return request({
    url: "data/role/add",
    method: "post",
    data
  })
}

export function getRoleDataApi(params: {
  pageSize?: number
  currentPage?: number
  roleId?: string
  roleName?: string
}) {
  return request<Role.GetRoleResponseData>({
    url: "data/role/list",
    method: "get",
    params
  })
}

export function updateRoleDataApi(data: Role.UpdateRoleRequestData) {
  return request({
    url: "data/role/update",
    method: "post",
    data
  })
}
