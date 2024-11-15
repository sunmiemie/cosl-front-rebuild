import { request } from "@/utils/service"
import type * as Board from "./types/board"

export function createBoardDataApi(data: Board.CreateBoardRequestData) {
  return request({
    url: "equipment/board/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteBoardDataApi(id: string) {
  return request({
    url: `equipment/board/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateBoardDataApi(data: Board.UpdateBoardRequestData) {
  return request({
    url: "equipment/board/update",
    method: "put",
    data
  })
}

/** 查 */
export function getBoardDataApi(params: {
  size: number
  currentPage: number
  seria: string | undefined
  batch: string | undefined
  status: string | undefined
  boardmodel: string
}) {
  return request<Board.GetBoardResponseData>({
    url: "equipment/board/list",
    method: "get",
    params
  })
}

export function getBoardDataBySn(serialNumber: string) {
  return request({
    url: `equipment/board/${serialNumber}`,
    method: "get"
  })
}

export function getProdBoardDataBySn(serialNumber: string) {
  return request({
    url: `equipment/prod-board/${serialNumber}`,
    method: "get"
  })
}
