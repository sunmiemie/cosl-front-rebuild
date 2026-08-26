import { request } from "@/utils/service"
import type * as Types from "./types"

export function getEngineerAssistantUsersApi() {
  return request<Types.GetEngineerAssistantUsersResponse>({
    url: "external/assistant/users/",
    method: "get"
  })
}

export function getEngineerAssistantTestTypesApi() {
  return request<Types.GetEngineerAssistantTestTypesResponse>({
    url: "external/assistant/test-types/",
    method: "get"
  })
}

export function getEngineerAssistantTestStatusesApi() {
  return request<Types.GetEngineerAssistantTestStatusesResponse>({
    url: "external/assistant/test-statuses/",
    method: "get"
  })
}

export function getEngineerAssistantApplicationFormsApi() {
  return request<Types.GetEngineerAssistantApplicationFormsResponse>({
    url: "external/assistant/application-forms/",
    method: "get"
  })
}

export function getEngineerAssistantApplicationFormDetailApi(testId: string, testType?: string) {
  return request<Types.GetEngineerAssistantApplicationFormDetailResponse>({
    url: `external/assistant/application-forms/${encodeURIComponent(testId)}/`,
    method: "get",
    params: testType ? { testType } : {}
  })
}

export function syncEngineerAssistantApplicationFormsApi(data: Types.SyncEngineerAssistantApplicationFormsBody) {
  return request<Types.SyncEngineerAssistantApplicationFormsResponse>({
    url: "external/assistant/sync/application-forms/",
    method: "post",
    data
  })
}

export function pushEngineerAssistantProcessesApi(data: Types.PushEngineerAssistantProcessesBody) {
  return request({
    url: "external/assistant/push-processes/",
    method: "post",
    data
  })
}

export function pushEngineerAssistantEquipmentApi(data: Types.PushEngineerAssistantEquipmentBody) {
  return request({
    url: "external/assistant/push-equipment/",
    method: "post",
    data
  })
}

export function pushEngineerAssistantSchedulesApi(data: Types.PushEngineerAssistantSchedulesBody) {
  return request({
    url: "external/assistant/push-schedules/",
    method: "post",
    data
  })
}

export function syncEngineerAssistantLocalScheduleApi(data: Types.SyncEngineerAssistantLocalScheduleBody) {
  return request<Types.SyncEngineerAssistantLocalResponse>({
    url: "external/assistant/sync/local-schedule/",
    method: "post",
    data
  })
}

export function syncEngineerAssistantReportsApi(data: Types.SyncEngineerAssistantReportsBody) {
  return request<Types.SyncEngineerAssistantReportsResponse>({
    url: "external/assistant/sync/reports/",
    method: "post",
    data
  })
}

export function changeEngineerAssistantStatusApi(data: Types.ChangeEngineerAssistantStatusBody) {
  return request({
    url: "external/assistant/change-status/",
    method: "post",
    data
  })
}

export function pushEngineerAssistantCommissionOrdersApi(data: Types.PushEngineerAssistantCommissionOrdersBody) {
  return request<Types.PushEngineerAssistantCommissionOrdersResponse>({
    url: "external/assistant/push-commission-orders/",
    method: "post",
    data
  })
}

export function getEngineerAssistantCommissionBindingsApi(params: Types.GetEngineerAssistantCommissionBindingsParams) {
  return request<Types.GetEngineerAssistantCommissionBindingsResponse>({
    url: "external/assistant/commission-bindings/",
    method: "get",
    params
  })
}
