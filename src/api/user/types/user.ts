export interface GetUserData {
  id: number
  username: string
  role: string
  introduction: string
  link: object
}

export type GetUserResponseData = ApiResponseData<{
  list: GetUserData[]
  total: number
}>

export interface CreateUserRequestData {
  username: ""
  password: ""
  role: ""
  introduction: ""
}

export interface UpdateUserRequestData {
  id: ""
  username: ""
  password?: ""
  role: ""
  introduction: ""
}
