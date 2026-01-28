/**
 * 电路板组管理 API 类型定义
 */

/** 电路板型号项 */
export interface BoardModelItem {
  id: number
  name: string
  code?: string
}

/** 电路板组 */
export interface BoardGroup {
  id: number
  name: string
  description: string
  boards: BoardModelItem[]
  createdAt?: string
  updatedAt?: string
  userId?: number
}

/** 获取电路板组列表请求参数 */
export interface GetBoardGroupRequestData {
  currentPage?: number
  pageSize?: number
  name?: string
}

/** 获取电路板组列表响应 */
export type GetBoardGroupResponseData = ApiResponseData<{
  list: BoardGroup[]
  total: number
}>

/** 获取电路板组详情响应 */
export type GetBoardGroupDetailResponseData = ApiResponseData<BoardGroup>

/** 创建电路板组请求参数 */
export interface CreateBoardGroupRequestData {
  name: string
  description?: string
  boardModelIds: number[]
  userId?: number
}

/** 创建电路板组响应 */
export type CreateBoardGroupResponseData = ApiResponseData<{
  id: number
}>

/** 更新电路板组请求参数 */
export interface UpdateBoardGroupRequestData {
  name?: string
  description?: string
  boardModelIds?: number[]
}
