/**
 * 电路板组管理 API
 */
import { request } from "@/utils/service"
import type * as BoardGroup from "./types/boardgroup"

/** 获取电路板组列表 */
export function getBoardGroupListApi(params: BoardGroup.GetBoardGroupRequestData) {
  return request<BoardGroup.GetBoardGroupResponseData>({
    url: "equipment/board-group/list/",
    method: "get",
    params
  })
}

/** 获取电路板组详情 */
export function getBoardGroupDetailApi(id: number) {
  return request<BoardGroup.GetBoardGroupDetailResponseData>({
    url: `equipment/board-group/detail/${id}/`,
    method: "get"
  })
}

/** 创建电路板组 */
export function createBoardGroupApi(data: BoardGroup.CreateBoardGroupRequestData) {
  return request<BoardGroup.CreateBoardGroupResponseData>({
    url: "equipment/board-group/create/",
    method: "post",
    data
  })
}

/** 更新电路板组 */
export function updateBoardGroupApi(id: number, data: BoardGroup.UpdateBoardGroupRequestData) {
  return request({
    url: `equipment/board-group/update/${id}/`,
    method: "put",
    data
  })
}

/** 删除电路板组 */
export function deleteBoardGroupApi(id: number) {
  return request({
    url: `equipment/board-group/delete/${id}/`,
    method: "delete"
  })
}
