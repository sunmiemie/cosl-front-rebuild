export interface CreateRoleRequestData {
  roleName: ""
  permissions: []
}

export interface GetRoleData {
  id: number
  roleName: string
  permissionIds: number[]
}

export type GetRoleResponseData = ApiResponseData<{
  list: GetRoleData[]
  total: number
}>

export interface UpdateRoleRequestData {
  id: ""
  roleName: ""
  permissions: number[]
}
