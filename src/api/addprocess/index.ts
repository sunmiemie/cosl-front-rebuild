import { request } from "@/utils/service"
import type * as AddProcess from "./types/index"
/**
 * 功能性测试
 */
export const upoloadfuncttest = (data): Promise<AddProcess.upoloadfuncttestResponse> => {
  return request({
    url: "/test/addprocess/functaddtest/",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}
export const upoloadeyestest = (data): Promise<AddProcess.upoloadfuncttestResponse> => {
  return request({
    url: "/test/addprocess/eyestest/",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}
export const upoloadxraytest = (data): Promise<AddProcess.upoloadfuncttestResponse> => {
  return request({
    url: "/test/addprocess/xraytest/",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}
//获取测试工艺列表数据
export const getTestProcessList = (params): Promise<AddProcess.TestProcessListResponse> => {
  return request({
    url: "/test/addprocess/list/",
    method: "get",
    params
  })
}

//获取测试工艺详情数据
export const getTestProcessDetail = (params):Promise<AddProcess.TestProcessDetailResponse> => {
  return request({
    url: "/test/addprocess/detail/",
    method: "get",
    params
  })
}
export const deleteTestProcessApi = (id: number) => {
  return request({
    url: `/test/process/delete/${id}`,
    method: "delete"
  })
}
//提交审核
export const submitCheck = (data: any) => {
  return request({
    url: "/test/addprocess/submitcheck/",
    method: "post",
    data
  })
}
//更改当前版本
export const changeVersion = (params) => {
  return request({
    url: "/test/addprocess/versionupdate",
    method: "get",
    params
  })
}
