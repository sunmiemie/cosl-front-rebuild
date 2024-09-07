import { request } from "@/utils/service"
import type * as Permission from "@/api/permission/types/permission"

export function getPermissionDataApi() {
  return request<Permission.GetPermissionResponseData>({
    url: "data/permission/list",
    method: "get"
  })
}
