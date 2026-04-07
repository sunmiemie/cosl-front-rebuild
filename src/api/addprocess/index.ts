import { request } from "@/utils/service"
import type * as AddProcess from "./types/index"

export const uploadfuncttest = (data: any): Promise<AddProcess.upoloadfuncttestResponse> => {
  return request({
    url: "/test/addprocess/functaddtest/",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}
export const uploadeyestest = (data: any): Promise<AddProcess.upoloadfuncttestResponse> => {
  return request({
    url: "/test/addprocess/eyestest/",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}
export const uploadxraytest = (data: any): Promise<AddProcess.upoloadfuncttestResponse> => {
  return request({
    url: "/test/addprocess/xraytest/",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}

export const updatefuncttest = (data: any): Promise<AddProcess.upoloadfuncttestResponse> => {
  return request({
    url: "/test/addprocess/funcupdate/",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}
export const updateeyestest = (data: any): Promise<AddProcess.upoloadfuncttestResponse> => {
  return request({
    url: "/test/addprocess/eyesupdate/",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}
export const updatexraytest = (data: any): Promise<AddProcess.upoloadfuncttestResponse> => {
  return request({
    url: "/test/addprocess/xrayupdate/",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}
//获取测试工艺列表数据
export const getTestProcessList = (params: any): Promise<AddProcess.TestProcessListResponse> => {
  return request({
    url: "/test/addprocess/list/",
    method: "get",
    params
  })
}

export const getAvailableFunctionalTestingProcess = (params: any): Promise<AddProcess.TestProcessListResponse> => {
  return request({
    url: "/test/func-process/",
    method: "get",
    params
  })
}

//获取测试工艺详情数据
export const getTestProcessDetail = (params: any): Promise<AddProcess.TestProcessDetailResponse> => {
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
export const changeVersion = (params: any) => {
  return request({
    url: "/test/addprocess/versionupdate",
    method: "get",
    params
  })
}

export const getProcessById = (params: any) => {
  return request<any>({
    url: "/test/addprocess/getsingle",
    method: "get",
    params
  })
}
