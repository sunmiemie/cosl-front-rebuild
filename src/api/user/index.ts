import { request } from "@/utils/service"
import type * as User from "./types/user"

// params: { pageSize: number; currentPage: number }
export function getUserDataApi() {
  return request<User.GetUserResponseData>({
    url: "data/user/list",
    method: "get"
    // params
  })
}
