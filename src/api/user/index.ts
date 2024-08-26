import { request } from "@/utils/service"
import type * as User from "./types/user"

export function getUserDataApi(params: { pageSize: number; currentPage: number }) {
  return request<User.GetUserResponseData>({
    url: "data/user/list",
    method: "get",
    params
  })
}
