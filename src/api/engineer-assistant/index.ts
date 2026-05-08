import { request } from "@/utils/service"
import type * as Types from "./types"

/** 获取外部工程师助手用户列表 */
export function getEngineerAssistantUsersApi() {
  return request<Types.GetEngineerAssistantUsersResponse>({
    url: "external/assistant/users/",
    method: "get"
  })
}

/** 获取外部工程师助手测试类型 */
export function getEngineerAssistantTestTypesApi() {
  return request<Types.GetEngineerAssistantTestTypesResponse>({
    url: "external/assistant/test-types/",
    method: "get"
  })
}

/** 获取外部工程师助手测试状态 */
export function getEngineerAssistantTestStatusesApi() {
  return request<Types.GetEngineerAssistantTestStatusesResponse>({
    url: "external/assistant/test-statuses/",
    method: "get"
  })
}

/** 获取外部工程师助手申请单列表 */
export function getEngineerAssistantApplicationFormsApi() {
  return request<Types.GetEngineerAssistantApplicationFormsResponse>({
    url: "external/assistant/application-forms/",
    method: "get"
  })
}

/** 获取外部工程师助手申请单详情 */
export function getEngineerAssistantApplicationFormDetailApi(testId: string, testType?: string) {
  return request<Types.GetEngineerAssistantApplicationFormDetailResponse>({
    url: `external/assistant/application-forms/${encodeURIComponent(testId)}/`,
    method: "get",
    params: testType ? { testType } : {}
  })
}

/** 推送工艺文件到外部工程师助手 */
export function pushEngineerAssistantProcessesApi(data: Types.PushEngineerAssistantProcessesBody) {
  return request({
    url: "external/assistant/push-processes/",
    method: "post",
    data
  })
}

/** 推送设备列表到外部工程师助手 */
export function pushEngineerAssistantEquipmentApi(data: Types.PushEngineerAssistantEquipmentBody) {
  return request({
    url: "external/assistant/push-equipment/",
    method: "post",
    data
  })
}

/** 推送排期到外部工程师助手 */
export function pushEngineerAssistantSchedulesApi(data: Types.PushEngineerAssistantSchedulesBody) {
  return request({
    url: "external/assistant/push-schedules/",
    method: "post",
    data
  })
}

/** 更新外部工程师助手测试状态 */
export function changeEngineerAssistantStatusApi(data: Types.ChangeEngineerAssistantStatusBody) {
  return request({
    url: "external/assistant/change-status/",
    method: "post",
    data
  })
}

/** 推送测试报告到外部工程师助手 */
export function pushEngineerAssistantReportsApi(data: Types.PushEngineerAssistantReportsBody) {
  return request({
    url: "external/assistant/push-reports/",
    method: "post",
    data
  })
}
