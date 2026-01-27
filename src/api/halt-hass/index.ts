import { request } from "@/utils/service"
import type * as HaltHass from "./types/index"

/**
 * 获取 HALT-HASS 工艺列表
 */
export const getHaltHassProcessList = (params: {
  currentPage?: number
  pageSize?: number
  name?: string
  status?: string
  boardGroupId?: string
}): Promise<HaltHass.HaltHassProcessListResponse> => {
  return request({
    url: "/test/halt-hass/list/",
    method: "get",
    params
  })
}

/**
 * 获取 HALT-HASS 工艺详情
 */
export const getHaltHassProcessDetail = (id: number): Promise<HaltHass.HaltHassProcessDetailResponse> => {
  return request({
    url: `/test/halt-hass/detail/${id}/`,
    method: "get"
  })
}

/**
 * 创建 HALT-HASS 工艺
 */
export const createHaltHassProcess = (data: HaltHass.HaltHassProcessCreateParams) => {
  return request({
    url: "/test/halt-hass/create/",
    method: "post",
    data
  })
}

/**
 * 更新 HALT-HASS 工艺
 */
export const updateHaltHassProcess = (id: number, data: HaltHass.HaltHassProcessUpdateParams) => {
  return request({
    url: `/test/halt-hass/update/${id}/`,
    method: "put",
    data
  })
}

/**
 * 删除 HALT-HASS 工艺
 */
export const deleteHaltHassProcess = (id: number) => {
  return request({
    url: `/test/halt-hass/delete/${id}/`,
    method: "delete"
  })
}

/**
 * 按电路板组获取可用工艺
 */
export const getHaltHassProcessByBoard = (boardId: number) => {
  return request({
    url: `/test/halt-hass/by-board/${boardId}/`,
    method: "get"
  })
}

/**
 * 获取工艺版本列表
 */
export const getHaltHassVersionList = (params: {
  boardGroupId: string
}): Promise<HaltHass.HaltHassVersionListResponse> => {
  return request({
    url: "/test/halt-hass/versions/",
    method: "get",
    params
  })
}

/**
 * 提交审核（复用现有接口）
 */
export const submitHaltHassToCheck = (data: { id: number }) => {
  return request({
    url: "/test/addprocess/submitcheck/",
    method: "post",
    data
  })
}

/**
 * 审核通过/不通过（复用现有接口）
 */
export const checkHaltHassPass = (data: { id: number; pass: boolean; user: number; reason?: string }) => {
  return request({
    url: "/test/check/pass/",
    method: "post",
    data
  })
}

/**
 * 更改当前激活版本（复用现有接口）
 */
export const changeHaltHassVersion = (params: { ID: number; version: number }) => {
  return request({
    url: "/test/addprocess/versionupdate/",
    method: "get",
    params
  })
}
