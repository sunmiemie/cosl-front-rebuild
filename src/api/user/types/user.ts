export interface GetUserData {
  id: number
  username: string
  role: number
  introduction: string
  nickname: string
}

export type GetUserResponseData = ApiResponseData<{
  list: GetUserData[]
  total: number
}>

export interface CreateUserRequestData {
  username: string
  password?: string
  nickname?: string
  role?: number | null
  introduction?: string
}

export interface UpdateUserRequestData {
  id: number
  username: string
  password?: string
  nickname?: string
  role?: number | null
  introduction?: string
}
