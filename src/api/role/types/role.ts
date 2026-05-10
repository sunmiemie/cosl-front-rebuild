export interface CreateRoleRequestData {
  roleName: string
  permissions: number[]
}

export interface GetRoleData {
  id: number
  roleName: string
  permissions: number[]
}

export type GetRoleResponseData = ApiResponseData<{
  list: GetRoleData[]
  total: number
}>

export interface UpdateRoleRequestData {
  roleId: number | string
  roleName: string
  permissions: number[]
}
