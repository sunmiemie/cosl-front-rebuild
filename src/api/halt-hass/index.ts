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
    method: "put",
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

// ==================== HALT-HASS 工单 API ====================

/**
 * 获取 HALT-HASS 工单列表
 */
export const getHaltHassOrderList = (params: {
  page?: number
  pageSize?: number
  status?: string
  orderNo?: string
}): Promise<HaltHass.HaltHassOrderListResponse> => {
  return request({
    url: "/test/halt-hass/order/list/",
    method: "get",
    params
  })
}

/**
 * 获取 HALT-HASS 工单详情
 */
export const getHaltHassOrderDetail = (orderId: number): Promise<HaltHass.HaltHassOrderDetailResponse> => {
  return request({
    url: `/test/halt-hass/order/detail/${orderId}/`,
    method: "get"
  })
}

/**
 * 创建 HALT-HASS 工单
 */
export const createHaltHassOrder = (data: HaltHass.HaltHassOrderCreateParams) => {
  return request({
    url: "/test/halt-hass/order/create/",
    method: "post",
    data
  })
}

/**
 * 发布 HALT-HASS 工单
 */
export const publishHaltHassOrder = (orderId: number) => {
  return request({
    url: `/test/halt-hass/order/publish/${orderId}/`,
    method: "post"
  })
}

/**
 * 删除 HALT-HASS 工单
 */
export const deleteHaltHassOrder = (orderId: number) => {
  return request({
    url: `/test/halt-hass/order/delete/${orderId}/`,
    method: "delete"
  })
}

/**
 * 获取批次下指定型号的电路板列表（HALT-HASS 专用）
 */
export const getHaltHassBoardsInfo = (params: { batchId: string | number; boardModelId: number }) => {
  return request<{ code: number; data: Array<{ id: number; serial_num: string }> }>({
    url: "/test/halt-hass/order/boards-by-batch/",
    method: "get",
    params
  })
}

// ==================== HALT-HASS 报告 API ====================

/**
 * 获取 HALT-HASS 报告列表
 */
export const getHaltHassReportList = (params: {
  page?: number
  pageSize?: number
  reviewStatus?: string
  orderNo?: string
}): Promise<HaltHass.HaltHassReportListResponse> => {
  return request({
    url: "/test/halt-hass/report/list/",
    method: "get",
    params
  })
}

/**
 * 获取 HALT-HASS 报告详情
 */
export const getHaltHassReportDetail = (reportId: number): Promise<HaltHass.HaltHassReportDetailResponse> => {
  return request({
    url: `/test/halt-hass/report/detail/${reportId}/`,
    method: "get"
  })
}

/**
 * 审核通过报告
 */
export const approveHaltHassReport = (reportId: number, data: { reviewerId: number; comment?: string }) => {
  return request({
    url: `/test/halt-hass/report/approve/${reportId}/`,
    method: "post",
    data
  })
}

/**
 * 审核打回报告
 */
export const rejectHaltHassReport = (reportId: number, data: { reviewerId: number; reason: string }) => {
  return request({
    url: `/test/halt-hass/report/reject/${reportId}/`,
    method: "post",
    data
  })
}
