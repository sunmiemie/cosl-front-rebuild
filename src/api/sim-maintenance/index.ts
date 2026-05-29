import { request } from "@/utils/service"
import type * as SimMaintenance from "./types"

export function getSimInstrumentUsageRecordListApi(params: SimMaintenance.SimMaintenanceListRequest) {
  return request<SimMaintenance.SimMaintenanceListResponse<SimMaintenance.SimInstrumentUsageRecordItem>>({
    url: "data/sim-maintenance/usage-records/list",
    method: "get",
    params
  })
}

export function getSimInstrumentMaintenanceReminderListApi(params: SimMaintenance.SimMaintenanceListRequest) {
  return request<SimMaintenance.SimMaintenanceListResponse<SimMaintenance.SimInstrumentMaintenanceReminderItem>>({
    url: "data/sim-maintenance/maintenance-reminders/list",
    method: "get",
    params
  })
}

export function getSimInstrumentMaintenanceRecordListApi(params: SimMaintenance.SimMaintenanceListRequest & { type?: string }) {
  return request<SimMaintenance.SimMaintenanceListResponse<SimMaintenance.SimInstrumentMaintenanceRecordItem>>({
    url: "data/sim-maintenance/maintenance-records/list",
    method: "get",
    params
  })
}

export function createSimInstrumentMaintenanceRecordApi(data: SimMaintenance.CreateSimInstrumentMaintenanceRecordRequest) {
  return request<SimMaintenance.SimMaintenanceItemResponse<SimMaintenance.SimInstrumentMaintenanceRecordItem>>({
    url: "data/sim-maintenance/maintenance-records/create",
    method: "post",
    data
  })
}

export function updateSimInstrumentMaintenanceRecordApi(
  recordId: number | string,
  data: SimMaintenance.UpdateSimInstrumentMaintenanceRecordRequest
) {
  return request<SimMaintenance.SimMaintenanceItemResponse<SimMaintenance.SimInstrumentMaintenanceRecordItem>>({
    url: `data/sim-maintenance/maintenance-records/update/${recordId}/`,
    method: "post",
    data
  })
}

export function deleteSimInstrumentMaintenanceRecordApi(recordId: number | string) {
  return request({
    url: `data/sim-maintenance/maintenance-records/delete/${recordId}/`,
    method: "delete"
  })
}
