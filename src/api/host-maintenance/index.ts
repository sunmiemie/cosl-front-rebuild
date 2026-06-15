import { request } from "@/utils/service"
import type * as HostMaintenance from "./types"

export function getHostUsageRecordListApi(params: HostMaintenance.HostMaintenanceListRequest) {
  return request<HostMaintenance.HostMaintenanceListResponse<HostMaintenance.HostUsageRecordItem>>({
    url: "equipment/host-maintenance/usage-records/list",
    method: "get",
    params
  })
}

export function createHostUsageRecordApi(data: HostMaintenance.CreateHostUsageRecordRequest) {
  return request<HostMaintenance.HostMaintenanceItemResponse<HostMaintenance.HostUsageRecordItem>>({
    url: "equipment/host-maintenance/usage-records/create",
    method: "post",
    data
  })
}

export function updateHostUsageRecordApi(
  recordId: number | string,
  data: HostMaintenance.UpdateHostUsageRecordRequest
) {
  return request<HostMaintenance.HostMaintenanceItemResponse<HostMaintenance.HostUsageRecordItem>>({
    url: `equipment/host-maintenance/usage-records/update/${recordId}/`,
    method: "post",
    data
  })
}

export function deleteHostUsageRecordApi(recordId: number | string) {
  return request({
    url: `equipment/host-maintenance/usage-records/delete/${recordId}/`,
    method: "delete"
  })
}

export function getHostMaintenanceRecordListApi(params: HostMaintenance.HostMaintenanceListRequest) {
  return request<HostMaintenance.HostMaintenanceListResponse<HostMaintenance.HostMaintenanceRecordItem>>({
    url: "equipment/host-maintenance/maintenance-records/list",
    method: "get",
    params
  })
}

export function createHostMaintenanceRecordApi(data: HostMaintenance.CreateHostMaintenanceRecordRequest) {
  return request<HostMaintenance.HostMaintenanceItemResponse<HostMaintenance.HostMaintenanceRecordItem>>({
    url: "equipment/host-maintenance/maintenance-records/create",
    method: "post",
    data
  })
}

export function updateHostMaintenanceRecordApi(
  recordId: number | string,
  data: HostMaintenance.UpdateHostMaintenanceRecordRequest
) {
  return request<HostMaintenance.HostMaintenanceItemResponse<HostMaintenance.HostMaintenanceRecordItem>>({
    url: `equipment/host-maintenance/maintenance-records/update/${recordId}/`,
    method: "post",
    data
  })
}

export function deleteHostMaintenanceRecordApi(recordId: number | string) {
  return request({
    url: `equipment/host-maintenance/maintenance-records/delete/${recordId}/`,
    method: "delete"
  })
}

export function getHostMaintenanceConfigApi(
  params: Pick<HostMaintenance.HostMaintenanceListRequest, "host_id" | "host_sn">
) {
  return request<HostMaintenance.HostMaintenanceItemResponse<HostMaintenance.HostMaintenanceConfigItem>>({
    url: "equipment/host-maintenance/config/detail",
    method: "get",
    params
  })
}

export function updateHostMaintenanceConfigApi(data: HostMaintenance.UpdateHostMaintenanceConfigRequest) {
  return request<HostMaintenance.HostMaintenanceItemResponse<HostMaintenance.HostMaintenanceConfigItem>>({
    url: "equipment/host-maintenance/config/update",
    method: "post",
    data
  })
}

export function getHostMaintenanceReminderListApi(params: HostMaintenance.HostMaintenanceListRequest) {
  return request<HostMaintenance.HostMaintenanceListResponse<HostMaintenance.HostMaintenanceConfigItem>>({
    url: "equipment/host-maintenance/reminders/list",
    method: "get",
    params
  })
}
