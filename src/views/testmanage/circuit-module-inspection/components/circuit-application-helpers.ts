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
  model: string
  batchNo: string
  supplier: string
  materialNo: string
  quantity: string
  status: string | number
  startTime?: string
}

export function getString(...values: unknown[]) {
  const value = values.find((item) => typeof item === "string" && item.trim())
  return typeof value === "string" ? value.trim() : ""
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
    model,
    batchNo: getString(board.pch),
    supplier: getString(board.gysmc),
    materialNo: getString(board.wlh),
    quantity: String(board.sl ?? ""),
    status: 0,
    startTime: getString(board.updateTime, board.createTime)
  }
}

export function formatMissingBoards(missingBoards: PublishCircuitModuleMissingBoard[]) {
  if (!missingBoards.length) return "未匹配到电路板，请检查批次号、SN、供应商名称和规格型号。"
  return missingBoards
    .map((board, index) => `${index + 1}. ${board.sn} / ${board.pch} / ${board.gysmc} / ${board.ggxh}`)
    .join("\n")
}
