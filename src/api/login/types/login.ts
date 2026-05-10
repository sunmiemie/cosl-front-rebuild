export interface LoginRequestData {
  /** admin 或 editor */
  username: "admin" | "editor"
  /** 密码 */
  password: string
}

export type LoginResponseData = ApiResponseData<{ token: string }>

export interface UserPermissionInfo {
  id: number
  name: string
  code?: string
  category?: string
  scope?: string
  action?: string
}

export type UserInfoResponseData = ApiResponseData<{
  id: number
  username: string
  roles: string[]
  permissionCodes?: string[]
  permissions?: UserPermissionInfo[]
  nickName: string
}>
