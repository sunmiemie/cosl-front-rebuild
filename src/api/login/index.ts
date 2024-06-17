import { request } from "@/utils/service"
import type * as Login from "./types/login"

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  return request<Login.LoginResponseData>({
    url: "login/login",
    method: "post",
    data
  })
}

/** 获取用户详情 */
export function getUserInfoApi(token: string) {
  return request<Login.UserInfoResponseData>({
    url: "login/info",
    method: "get",
    params: { token }
  })
}
