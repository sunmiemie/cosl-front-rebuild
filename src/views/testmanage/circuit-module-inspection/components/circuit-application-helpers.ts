import type {
  CircuitModuleGeneratedOrderType,
  DlbCircuitBoardItem,
  PublishCircuitModuleMissingBoard
} from "@/api/circuit-module-application"

export interface CircuitApplicationUiBoard {
  id: string
  boardId?: string
  prodBoardId?: string
  tempBoardId?: string
  seria: string
  sn: string
  assistantSn?: string
  sourceSn?: string
  originalSn?: string
  serial: string
  serialNum?: string
  name: string
  sampleName: string
  model: string
  batchNo: string
  supplier: string
  materialNo: string
  quantity: string
  consignor: string
  product?: string
  unit?: string
  testCategory?: string
  testContent?: string
  initialInspection?: string
  contractNo?: string
  arrivalDate?: string
  xray?: string
  bow?: string
  twoD?: string
  threeD?: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  status: string | number
  publishStatus?: string | number
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

export function getDisplayString(...values: unknown[]) {
  const value = values.find((item) => {
    if (typeof item === "string") return item.trim()
    return typeof item === "number" && Number.isFinite(item)
  })
  if (value === undefined || value === null) return ""
  return String(value).trim()
}

export function normalizeDlbBoardState(...values: unknown[]) {
  const value = getDisplayString(...values)
  const normalized = value.toLowerCase()
  const stateMap: Record<string, string> = {
    "0": "未发布",
    "1": "已发布",
    "2": "测试中",
    "3": "已完成",
    "4": "已挂起",
    draft: "未发布",
    unlinked: "未发布",
    published: "已发布",
    linked: "已发布",
    ready: "已发布",
    testing: "测试中",
    in_progress: "测试中",
    done: "已完成",
    complete: "已完成",
    completed: "已完成"
  }
  return stateMap[normalized] || value
}

function normalizeProcessKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[＿_－—–]/g, "-")
    .replace(/\s+/g, " ")
}

function findCircuitProcessOption(value: string) {
  const exactOption = CIRCUIT_PROCESS_OPTIONS.find((option) => option === value)
  if (exactOption) return exactOption

  const normalized = normalizeProcessKey(value)
  const compact = normalized.replace(/\s+/g, "").replace(/测试$/i, "")
  return circuitProcessAliasMap.get(normalized) || circuitProcessAliasMap.get(compact) || ""
}

export function normalizeCircuitProcessName(...values: unknown[]) {
  const rawValue = getString(...values)
  if (!rawValue) return ""

  return findCircuitProcessOption(rawValue) || rawValue
}

export function resolveCircuitProcessName(...values: unknown[]) {
  for (const value of values) {
    const rawValue = getString(value)
    if (!rawValue) continue

    const option = findCircuitProcessOption(rawValue)
    if (option) return option
  }
  return ""
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
  const sn =
    getString(board.sn, board.seria, board.serial, board.serial_num, board.serialNumber, board.board_serial) ||
    `${applicationNo || "DLB"}-${index + 1}`
  const sourceSn = getString(board.assistantSn, board.assistant_sn, board.sourceSn, board.source_sn, board.originalSn, board.original_sn, board.sn)
  const model = getString(board.ggxh, board.ypmc, "电路板模块")
  const fallbackBatchNo = `${applicationNo || "DLB"}-${String(index + 1).padStart(2, "0")}`
  const boardId = getDisplayString(board.boardId, board.board_id)
  const prodBoardId = getDisplayString(board.prodBoardId, board.prod_board_id, board.board_id)
  const tempBoardId = getDisplayString(board.tempBoardId, board.temp_board_id)
  const publishStatus = board.publishStatus ?? board.publish_status ?? board.status ?? 0
  return {
    id: String((board.id ?? "") || boardId || prodBoardId || tempBoardId || sn),
    boardId,
    prodBoardId,
    tempBoardId,
    seria: sn,
    sn,
    assistantSn: sourceSn,
    sourceSn,
    originalSn: sourceSn,
    serial: sn,
    serialNum: getString(board.serial_num, board.serialNumber, board.board_serial, sn),
    name: getString(board.ypmc, model),
    sampleName: getString(board.ypmc, model),
    model,
    batchNo: getString(board.pch, board.batchNo, board.batch_id, board.batchId) || fallbackBatchNo,
    supplier: getString(board.gysmc) || "未提供",
    materialNo: getString(board.wlh),
    quantity: getDisplayString(board.sl) || "1",
    consignor: getString(board.wtr),
    product: getString(board.sscp),
    unit: getString(board.ssdw),
    testCategory: getString(board.cslb),
    testContent: getString(board.csnr),
    initialInspection: getString(board.cjfj),
    contractNo: getString(board.hth),
    arrivalDate: getString(board.dhrq),
    xray: getString(board.ray),
    bow: getString(board.gqd),
    twoD: getString(board.towtest),
    threeD: getString(board.threetest),
    createBy: getString(board.createBy),
    createTime: getString(board.createTime),
    updateBy: getString(board.updateBy),
    updateTime: getString(board.updateTime),
    status: publishStatus,
    publishStatus,
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
