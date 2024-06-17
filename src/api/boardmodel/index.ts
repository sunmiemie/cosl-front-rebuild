import { request } from "@/utils/service"
import type * as BoardModel from "./types/boardmodel"
import { UnwrapNestedRefs } from "vue"

export function createBoardModelDataApi(
  data: UnwrapNestedRefs<{
    des: string
    name: string
    checkList: string
    id: null
  }>
) {
  return request({
    url: "equipment/boardmodel/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteBoardModelDataApi(id: string) {
  return request({
    url: `equipment/boardmodel/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateBoardModelDataApi(data: BoardModel.UpdateBoardModelRequestData) {
  return request({
    url: "equipment/boardmodel/update",
    method: "post",
    data
  })
}

export function getBoardModelDataApi(params: BoardModel.GetBoardModelRequestData) {
  return request<BoardModel.GetBoardModelResponseData>({
    url: "equipment/boardmodel/list",
    method: "get",
    params
  })
}
