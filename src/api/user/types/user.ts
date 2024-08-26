export interface GetUserData {
  id: number
  username: string
}

export type GetUserResponseData = ApiResponseData<{
  list: GetUserData[]
  total: number
}>
