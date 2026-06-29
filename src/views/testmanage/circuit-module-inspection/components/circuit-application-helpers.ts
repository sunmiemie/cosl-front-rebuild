import type {
  CircuitModuleGeneratedOrderType,
  DlbCircuitBoardItem,
  PublishCircuitModuleMissingBoard
} from "@/api/circuit-module-application"

export interface CircuitApplicationUiBoard {
  id: string
  seria: string
  sn: string
  serial: string
  name: string
  sampleName: string
  model: string
  batchNo: string
  supplier: string
  materialNo: string
  quantity: string
  consignor: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  status: string | number
  startTime?: string
  raw?: unknown
}

export const CIRCUIT_PROCESS_OPTIONS = [
  "功能性测试",
  "弓曲度测试",
  "2D留存",
  "3D检测",
  "X-Ray测试",
  "HALT-HASS测试"
] as const

const circuitProcessAliasMap = new Map<string, (typeof CIRCUIT_PROCESS_OPTIONS)[number]>([
  ["功能性测试", "功能性测试"],
  ["功能测试", "功能性测试"],
  ["function", "功能性测试"],
  ["functional", "功能性测试"],
  ["functionaltest", "功能性测试"],
  ["弓曲度测试", "弓曲度测试"],
  ["弓曲度", "弓曲度测试"],
  ["bow", "弓曲度测试"],
  ["warpage", "弓曲度测试"],
  ["2d留存", "2D留存"],
  ["2d", "2D留存"],
  ["2d检测", "2D留存"],
  ["3d检测", "3D检测"],
  ["3d", "3D检测"],
  ["xray", "X-Ray测试"],
  ["x-ray", "X-Ray测试"],
  ["xray测试", "X-Ray测试"],
  ["x-ray测试", "X-Ray测试"],
  ["halt-hass", "HALT-HASS测试"],
  ["halt&hass", "HALT-HASS测试"],
  ["halthass", "HALT-HASS测试"],
  ["halt/hass", "HALT-HASS测试"],
  ["halt hass", "HALT-HASS测试"],
  ["halt-hass测试", "HALT-HASS测试"],
  ["halt&hass测试", "HALT-HASS测试"]
])

export function getString(...values: unknown[]) {
  const value = values.find((item) => typeof item === "string" && item.trim())
  return typeof value === "string" ? value.trim() : ""
}

function normalizeProcessKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[＿_－—–]/g, "-")
    .replace(/\s+/g, " ")
}

export function normalizeCircuitProcessName(...values: unknown[]) {
  const rawValue = getString(...values)
  if (!rawValue) return ""

  const exactOption = CIRCUIT_PROCESS_OPTIONS.find((option) => option === rawValue)
  if (exactOption) return exactOption

  const normalized = normalizeProcessKey(rawValue)
  const compact = normalized.replace(/\s+/g, "").replace(/测试$/i, "")
  return circuitProcessAliasMap.get(normalized) || circuitProcessAliasMap.get(compact) || rawValue
}

export function getGeneratedOrderType(sfxyjcgy: unknown): CircuitModuleGeneratedOrderType {
  const value = String(sfxyjcgy ?? "")
    .trim()
    .toLowerCase()
  if (["是", "yes", "y", "true", "1", "需要", "生产"].includes(value)) return "production"
  if (["否", "no", "n", "false", "0", "不需要", "临时", "temporary", "temp"].includes(value)) return "temporary"
  return "temporary"
}

export function getCraftFlagText(sfxyjcgy: unknown) {
  return getGeneratedOrderType(sfxyjcgy) === "production" ? "是" : "否"
}

export function getGeneratedOrderTypeText(sfxyjcgy: unknown) {
  return getGeneratedOrderType(sfxyjcgy) === "production" ? "生产测试工单" : "临时测试工单"
}

export function mapDlbBoardToUiBoard(
  board: DlbCircuitBoardItem,
  index: number,
  applicationNo: string
): CircuitApplicationUiBoard {
  const sn = getString(board.sn) || `${applicationNo || "DLB"}-${index + 1}`
  const model = getString(board.ggxh, board.ypmc, "电路板模块")
  return {
    id: String(board.id ?? sn),
    seria: sn,
    sn,
    serial: sn,
    name: getString(board.ypmc, model),
    sampleName: getString(board.ypmc, model),
    model,
    batchNo: getString(board.pch),
    supplier: getString(board.gysmc),
    materialNo: getString(board.wlh),
    quantity: String(board.sl ?? ""),
    consignor: getString(board.wtr),
    createBy: getString(board.createBy),
    createTime: getString(board.createTime),
    updateBy: getString(board.updateBy),
    updateTime: getString(board.updateTime),
    status: 0,
    startTime: getString(board.updateTime, board.createTime),
    raw: board
  }
}

export function formatMissingBoards(missingBoards: PublishCircuitModuleMissingBoard[]) {
  if (!missingBoards.length) return "未匹配到电路板，请检查批次号、SN、供应商名称和规格型号。"
  return missingBoards
    .map((board, index) => `${index + 1}. ${board.sn} / ${board.pch} / ${board.gysmc} / ${board.ggxh}`)
    .join("\n")
}
