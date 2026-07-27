import { request } from "@/utils/service"
import type {
  BackupCreateRequest,
  BackupCreateResponse,
  BackupListRequest,
  BackupListResponse,
  BackupRestoreResponse,
  DatabaseOverviewResponse,
  DatabaseTablesResponse,
  OperationLogListRequest,
  OperationLogListResponse
} from "./types"

export function getDatabaseOverviewApi() {
  return request<DatabaseOverviewResponse>({
    url: "system/database/overview",
    method: "get"
  })
}

export function getDatabaseTablesApi() {
  return request<DatabaseTablesResponse>({
    url: "system/database/tables",
    method: "get"
  })
}

export function getDatabaseBackupsApi(params: BackupListRequest) {
  return request<BackupListResponse>({
    url: "system/backups",
    method: "get",
    params
  })
}

export function createDatabaseBackupApi(data: BackupCreateRequest) {
  return request<BackupCreateResponse>({
    url: "system/backups/create",
    method: "post",
    data
  })
}

export function restoreDatabaseBackupApi(backupId: number, confirmation: string) {
  return request<BackupRestoreResponse>({
    url: `system/backups/${backupId}/restore`,
    method: "post",
    data: { confirmation }
  })
}

export function downloadDatabaseBackupApi(backupId: number) {
  return request<Blob>({
    url: `system/backups/${backupId}/download`,
    method: "get",
    responseType: "blob"
  })
}

export function deleteDatabaseBackupApi(backupId: number) {
  return request<ApiResponseData<{ id: number }>>({
    url: `system/backups/${backupId}`,
    method: "delete"
  })
}

export function getOperationLogsApi(params: OperationLogListRequest) {
  return request<OperationLogListResponse>({
    url: "system/operation-logs",
    method: "get",
    params
  })
}

export function exportOperationLogsApi(params: Omit<OperationLogListRequest, "currentPage" | "pageSize">) {
  return request<Blob>({
    url: "system/operation-logs/export",
    method: "get",
    params,
    responseType: "blob"
  })
}
