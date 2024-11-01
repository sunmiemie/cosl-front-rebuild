import { request } from "@/utils/service"
import type * as TestType from "./types/testtype"

export function createTestTypeDataApi(data: TestType.CreateTestTypeRequestData) {
  // console.log(data)
  return request({
    url: "test/testtype/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteTestTypeDataApi(id: string) {
  return request({
    url: `test/testtype/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateTestTypeDataApi(data: TestType.UpdateTestTypeRequestData) {
  return request({
    url: "test/testtype/update",
    method: "post",
    data
  })
}

/** 查 */
export function getTestTypeDataApi(params: { size: number; currentPage: number; name?: string }) {
  return request<TestType.GetTestTypeResponseData>({
    url: "test/testtype/list",
    method: "get",
    params
  })
}
export function getBoardTestTypeDataApi(data: any) {
  return request({
    url: "test/board-testtype/list/",
    method: "post",
    data
  })
}
export function getBugReportTestTypeDataApi(data: any) {
  return request({
    url: "test/bug-report-testtype/list/",
    method: "post",
    data
  })
}
export function getDevTestTypeDataApi(data: any) {
  return request({
    url: "test/devboard-testtype/list/",
    method: "post",
    data
  })
}
export function getBugReportDevTestTypeDataApi(data: any) {
  return request({
    url: "test/dev-bug-report-testtype/list/",
    method: "post",
    data
  })
}
