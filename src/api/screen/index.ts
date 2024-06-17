/**
 * 大屏可视化  接口
 */
import { request } from "@/utils/service"

/**
 * 实时工单数量
 */
export const getTicketslist = () => {
  return request({
    url: "/screen/Ticketslist",
    method: "GET"
  })
}

/**
 * 型号数量
 */

export const getTylemodelNumber = () => {
  return request({
    url: "/screen/decivemodel",
    method: "GET"
  })
}

/**
 * 每日工单列表情况
 */

export const everydayTestList = () => {
  return request({
    url: "/screen/tickets",
    method: "GET"
  })
}
/**
 * 进度监控
 */

export const testprogress = () => {
  return request({
    url: "/screen/testprogress",
    method: "GET"
  })
}
/**
 * 设备数量
 */
export const getDeviceNumber = () => {
  return request({
    url: "/screen/devicenumber",
    method: "GET"
  })
}

// 设备分布
export const getDeviceproportion = () => {
  return request({
    url: "/screen/deviceproportion",
    method: "GET"
  })
}
//设备状态
export const getDeiveStatus = () => {
  return request({
    url: "/screen/devicestatus",
    method: "GET"
  })
}
