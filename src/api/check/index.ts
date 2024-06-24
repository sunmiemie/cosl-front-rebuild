import { request } from "@/utils/service"

export const checkListDataApi = (params: any) => {
  return request({
    url: "/test/check/list/",
    method: "get",
    params
  })
}
