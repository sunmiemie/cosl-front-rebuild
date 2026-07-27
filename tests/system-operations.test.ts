import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("系统运维模块", () => {
  const router = read("src/router/index.ts")
  const permissions = read("src/constants/permission.ts")
  const permissionStore = read("src/store/modules/permission.ts")
  const api = read("src/api/system-operations/index.ts")
  const backupPage = read("src/views/system-operations/backups/index.vue")
  const operationLogPage = read("src/views/system-operations/operation-logs/index.vue")

  it("注册同级系统运维菜单并按两个独立权限控制子页面", () => {
    expect(router).toContain('path: "/system-operations"')
    expect(router).toContain('title: "系统运维"')
    expect(router).toContain('title: "数据热备份"')
    expect(router).toContain('title: "操作日志"')
    expect(permissions).toContain('SystemBackupManage: "SYSTEM_BACKUP_MANAGE"')
    expect(permissions).toContain('OperationLogView: "OPERATION_LOG_VIEW"')
    expect(permissionStore).toContain('["/permission", "/system-operations"]')
  })

  it("热备份页面具备自定义范围、下载、删除和带安全备份的还原确认", () => {
    expect(backupPage).toContain("createDatabaseBackupApi")
    expect(backupPage).toContain("downloadDatabaseBackupApi")
    expect(backupPage).toContain("deleteDatabaseBackupApi")
    expect(backupPage).toContain("restoreDatabaseBackupApi")
    expect(backupPage).toContain("指定数据表")
    expect(backupPage).toContain("还原前安全备份")
    expect(backupPage).toContain("restoreConfirmation.value.trim() ===")
  })

  it("操作日志支持组合筛选、详情和导出", () => {
    expect(operationLogPage).toContain("filters.username")
    expect(operationLogPage).toContain("filters.module")
    expect(operationLogPage).toContain("filters.action")
    expect(operationLogPage).toContain("filters.result")
    expect(operationLogPage).toContain("filters.dateRange")
    expect(operationLogPage).toContain("exportOperationLogsApi")
    expect(operationLogPage).toContain('title="操作日志详情"')
    expect(operationLogPage).toContain("请求摘要")
  })

  it("前端请求与后端系统运维接口保持一致", () => {
    expect(api).toContain('url: "system/database/overview"')
    expect(api).toContain('url: "system/database/tables"')
    expect(api).toContain('url: "system/backups/create"')
    expect(api).toContain("system/backups/${backupId}/restore")
    expect(api).toContain('url: "system/operation-logs"')
    expect(api).toContain('url: "system/operation-logs/export"')
  })
})
