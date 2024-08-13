import { request } from "@/utils/service"
import type * as TempBoard from "@/api/temp-board/types/temp-board"

export function createTempBoardApi(data: TempBoard.CreateTempBoardRequestData) {
  return request({
    url: "equipment/temp-board/add",
    method: "post",
    data
  })
}

export function updateTempBoardDataApi(data: { serialNumber: string; description: string; id: null }) {
  return request({
    url: "equipment/temp-board/update",
    method: "post",
    data
  })
}

export function getTempBoardDataApi(params: TempBoard.GetTempBoardRequestData) {
  return request<TempBoard.GetTempBoardResponseData>({
    url: "equipment/temp-board/list",
    method: "get",
    params
  })
}
