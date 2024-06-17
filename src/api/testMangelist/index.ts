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
export const getbordsinfo = (id: string) => {
  return request<TestMange.getBordsInfoType>({
    url: "/test/unitboardlist",
    method: "get",
    params: {
      id
    }
  })
}

// 根据型号id获取信息

/**
 * @description 传入一个电路板型号id值，获取该型号电路板的名称，
 * 可进行的测试（功能性测试.....)，
 * 以及每个可进行测试的当前激活的测试工艺所绑定的设备型号下的具体设备列表（夹具，主机，其他设备）
 */
export const getTestMangeInfo = (id) => {
  return request({
    url: "/test/publictest",
    method: "get",
    params: {
      id
    }
  })
}
/**
 * @description 发布测试工单
 * @param {object} params - 参数
 * @param {string} params.number - 测试工单编号
 * @param {string} params.name - 测试工单名称
 * @param {string} params.starttime - 开始时间
 * @param {string} params.endtime - 结束时间
 * @param {string} params.type - 测试工艺类型
 * @returns {Promise<void>} - 无响应体
 */
export const TestMangePublc = ({ number, name, starttime, endtime, type }) => {
  return request({
    url: "/test/testTicket",
    method: "get",
    params: {
      number,
      name,
      starttime,
      endtime,
      type
    }
  })
}

// 删除测试工单
export const DelTestMange = ({ number, name, starttime, endtime, type }) => {
  return request({
    url: "/test/deleteTick",
    method: "get",
    params: {
      number,
      name,
      starttime,
      endtime,
      type
    }
  })
}

/**
 * @description 获取测试工单列表表格
 * @param {object} params - 参数
 * @param {string} [params.number] - 工单编号
 * @param {string} [params.TestName] - 工单名称
 * @param {string} [params.TestType] - 工单类型
 * @param {string} [params.TestStatus] - 工单状态
 * @returns {Promise<TestMange.getTestMangeTableType>} 测试工单列表
 */
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
