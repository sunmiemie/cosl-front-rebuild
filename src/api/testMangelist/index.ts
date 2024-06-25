import { request } from "@/utils/service"
import type * as TestMange from "./types/index"

/**
 * @description 获取新增测试工单二级导航
 * @returns {Promise<TestMange.getTestMangePathType>} 测试工单二级导航
 */
export const getTestMangePath = (): Promise<TestMange.getTestMangePathType> => {
  return request<TestMange.getTestMangePathType>({
    url: "/test/testpath",
    method: "get"
  })
}

// 根据批次id获取电路板信息(id,序列号)
export const getbordsinfo = (params: any) => {
  return request<TestMange.getBordsInfoType>({
    url: "/test/unitboardlist",
    method: "get",
    params
  })
}

export const createTestUnitApi = (data: any) => {
  return request({
    url: "/test/testunit/add/",
    method: "post",
    data
  })
}
export const publicTestUnitApi = (data: any) => {
  return request({
    url: "/test/testunit/public/",
    method: "put",
    data
  })
}
// 删除测试工单
export const deleteTestUnitApi = (id: number) => {
  return request({
    url: `/test/testunit/delete/${id}`,
    method: "delete"
  })
}

export const getTestMangeTable = ({
  number,
  TestName,
  TestType,
  TestStatus,
  Daterange,
  currentPage,
  pageSize
}: TestMange.inpTestMangeTableDataType): Promise<TestMange.getTestMangeTableType> => {
  return request<TestMange.getTestMangeTableType>({
    url: "/test/getTableData",
    method: "get",
    params: {
      number,
      TestName,
      TestType,
      TestStatus,
      Daterange,
      currentPage,
      pageSize
    }
  })
}

// 测试工艺接口

/**
 * @description 测试工艺二级导航
 * GET 请求
 */

export const getProcessPath = () => {}
