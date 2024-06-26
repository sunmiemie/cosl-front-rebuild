import { request } from "@/utils/service"

export const checkListDataApi = (params: any) => {
  return request({
    url: "/test/check/list/",
    method: "get",
    params
  })
}

export const checkEyesDataApi = (params: any) => {
  return request({
    url: "/test/check/eyes/",
    method: "get",
    params
  })
}

export const checkXrayDataApi = (params: any) => {
  return request({
    url: "/test/check/xray/",
    method: "get",
    params
  })
}

export const checkFuncDataApi = (params: any) => {
  return request({
    url: "/test/check/func/",
    method: "get",
    params
  })
}
