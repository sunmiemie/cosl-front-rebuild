export interface DatabaseOverview {
  database_name: string
  host: string
  table_count: number
  database_size: number
  backup_count: number
  backup_size: number
  latest_backup_at?: string | null
  latest_backup_name?: string
}

export interface DatabaseTableInfo {
  name: string
  row_count: number
  size: number
}

export type BackupScope = "full" | "tables"
export type BackupStatus = "running" | "success" | "failed" | "restoring" | "restore_failed"

export interface DatabaseBackupRecord {
  id: number
  backup_name: string
  scope: BackupScope
  tables: string[]
  database_name: string
  file_name: string
  file_size: number
  checksum: string
  status: BackupStatus
  remark: string
  failure_message: string
  created_by_id?: number | null
  created_by_name: string
  created_at: string
  completed_at?: string | null
  last_restored_at?: string | null
  last_restored_by_name?: string
  file_exists: boolean
  can_restore: boolean
}

export interface BackupListRequest {
  keyword?: string
  status?: string
  scope?: string
  startDate?: string
  endDate?: string
  currentPage: number
  pageSize: number
}

export interface BackupCreateRequest {
  backupName: string
  scope: BackupScope
  tables: string[]
  remark?: string
}

export interface OperationLogItem {
  id: number
  user_id?: number | null
  username: string
  module: string
  action: string
  operation: string
  object_type: string
  object_id: string
  method: string
  path: string
  query_params: Record<string, unknown>
  request_data: Record<string, unknown>
  response_status: number
  response_message: string
  result: "success" | "failed"
  ip_address: string
  user_agent: string
  duration_ms: number
  created_at: string
}

export interface OperationLogListRequest {
  keyword?: string
  username?: string
  module?: string
  action?: string
  result?: string
  startDate?: string
  endDate?: string
  currentPage: number
  pageSize: number
}

export type DatabaseOverviewResponse = ApiResponseData<DatabaseOverview>
export type DatabaseTablesResponse = ApiResponseData<DatabaseTableInfo[]>
export type BackupListResponse = ApiResponseData<{
  list: DatabaseBackupRecord[]
  total: number
  currentPage: number
  pageSize: number
}>
export type BackupCreateResponse = ApiResponseData<DatabaseBackupRecord>
export type BackupRestoreResponse = ApiResponseData<{
  backup: DatabaseBackupRecord
  safety_backup: DatabaseBackupRecord
}>
export type OperationLogListResponse = ApiResponseData<{
  list: OperationLogItem[]
  total: number
  currentPage: number
  pageSize: number
  module_options: string[]
  action_options: string[]
}>
