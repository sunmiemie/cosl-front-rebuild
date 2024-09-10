import { request } from "@/utils/service"
import type * as User from "./types/user"

export function getUserDataApi(params: {
  pageSize: number
  currentPage: number
  userId?: string
  username?: string
  nickname?: string
}) {
  return request<User.GetUserResponseData>({
    url: "data/user/list",
    method: "get",
    params
  })
}

export function createUserDataApi(data: User.CreateUserRequestData) {
  return request({
    url: "data/user/add",
    method: "post",
    data
  })
}

export function updateUserDataApi(data: User.UpdateUserRequestData) {
  return request({
    url: "data/user/update",
    method: "post",
    data
  })
}
