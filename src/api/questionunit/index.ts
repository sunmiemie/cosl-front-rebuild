import { request } from "@/utils/service"

export const questionUnitDataApi = (params: any) => {
  return request({
    url: "test/questionunit/list/",
    method: "get",
    params
  })
}

export const questionOperateDataApi = (params: any) => {
  return request({
    url: "test/questionunit/download/",
    method: "get",
    params
  })
}
