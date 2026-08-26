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
  instrumentModelId?: string
  productModelId?: string
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
  instrument?: string
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

function isUnreadablePlaceholder(value: string) {
  return /^\?+$/.test(value.trim())
}

export function getString(...values: unknown[]) {
  const value = values.find((item) => typeof item === "string" && item.trim() && !isUnreadablePlaceholder(item))
  return typeof value === "string" ? value.trim() : ""
}

export function getDisplayString(...values: unknown[]) {
  const value = values.find((item) => {
    if (typeof item === "string") return item.trim() && !isUnreadablePlaceholder(item)
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

/**
 * 优先保留接口明确返回的工单类型；旧数据仅在 nature 有明确值时兼容读取。
 * 两个字段都缺失时安全降级为临时工单，避免把未确认数据误发为生产工单。
 */
export function resolveCraftFlagValue(sfxyjcgy: unknown, legacyNature?: unknown) {
  return getString(sfxyjcgy) || getString(legacyNature) || "否"
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
  const sourceSn = getString(
    board.assistantSn,
    board.assistant_sn,
    board.sourceSn,
    board.source_sn,
    board.originalSn,
    board.original_sn,
    board.sn
  )
  const model = getString(board.ggxh, board.ypmc, "电路板模块")
  const fallbackBatchNo = `${applicationNo || "DLB"}-${String(index + 1).padStart(2, "0")}`
  const boardId = getDisplayString(board.boardId, board.board_id)
  // boardId/board_id 来自小助手，不能当作本地生产板主键。
  const prodBoardId = getDisplayString(board.prodBoardId, board.prod_board_id)
  const tempBoardId = getDisplayString(board.tempBoardId, board.temp_board_id)
  const instrumentModelId = getDisplayString(board.instrumentModelId, board.instrument_model_id)
  const productModelId = getDisplayString(board.productModelId, board.product_model_id)
  const publishStatus = board.publishStatus ?? board.publish_status ?? board.status ?? 0
  return {
    id: String((board.id ?? "") || boardId || prodBoardId || tempBoardId || sn),
    boardId,
    prodBoardId,
    tempBoardId,
    instrumentModelId,
    productModelId,
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
    product: instrumentModelId ? getString(board.product, board.productModelName) : getString(board.sscp, board.product),
    instrument: getString(board.instrumentModelName, instrumentModelId ? board.sscp : undefined),
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

export type LocalBoardIdKind = "production" | "temporary"

type BoardLikeRecord = Record<string, unknown>

function asRecord(value: unknown): BoardLikeRecord {
  return value && typeof value === "object" ? (value as BoardLikeRecord) : {}
}

const CIRCUIT_BOARD_STABLE_ID_KEYS = [
  "externalBoardId",
  "external_board_id",
  "assistantBoardId",
  "assistant_board_id",
  "boardId",
  "board_id",
  "prodBoardId",
  "prod_board_id",
  "tempBoardId",
  "temp_board_id",
  "id"
] as const

const CIRCUIT_BOARD_SERIAL_KEYS = [
  "assistantSn",
  "assistant_sn",
  "sourceSn",
  "source_sn",
  "originalSn",
  "original_sn",
  "serial",
  "sn",
  "seria",
  "serialNum",
  "serial_num",
  "serialNumber",
  "board_serial",
  "boardSerial"
] as const

function collectBoardIdentityValues(value: unknown, keys: readonly string[], normalize = false) {
  const record = asRecord(value)
  const raw = asRecord(record.raw)
  return new Set(
    [record, raw]
      .flatMap((item) => keys.map((key) => item[key]))
      .map((item) => (normalize ? normalizeBoardSerial(item) : getDisplayString(item)))
      .filter((item) => item && item !== "-")
  )
}

/**
 * 判断两条申请单板记录是否代表同一块板。
 *
 * dlbTestId/testId 属于整张申请单，多块板会共享，不能用于板级匹配。只要双方
 * 都有稳定板 ID，就必须按板 ID 判断；仅在双方都没有板 ID 的旧数据中才回退到 SN。
 */
export function isSameCircuitApplicationBoardRecord(target: unknown, candidate: unknown) {
  if (target === candidate) return true
  if (!target || !candidate || typeof target !== "object" || typeof candidate !== "object") return false

  const targetIds = collectBoardIdentityValues(target, CIRCUIT_BOARD_STABLE_ID_KEYS)
  const candidateIds = collectBoardIdentityValues(candidate, CIRCUIT_BOARD_STABLE_ID_KEYS)
  if (targetIds.size || candidateIds.size) {
    return targetIds.size > 0 && candidateIds.size > 0 && [...candidateIds].some((id) => targetIds.has(id))
  }

  const targetSerials = collectBoardIdentityValues(target, CIRCUIT_BOARD_SERIAL_KEYS, true)
  const candidateSerials = collectBoardIdentityValues(candidate, CIRCUIT_BOARD_SERIAL_KEYS, true)
  return [...candidateSerials].some((serial) => targetSerials.has(serial))
}

/** SN 只做字符宽度、大小写和首尾空白标准化，不移除业务标点。 */
export function normalizeBoardSerial(value: unknown) {
  return getDisplayString(value).normalize("NFKC").toUpperCase()
}

/**
 * 按起始 SN 展开批量电路板序列号。
 *
 * 起始 SN 末尾已有数字时直接递增末尾数字，并保留原有位数；例如
 * `25081555-001`、数量 3 会得到 `25081555-001` 至 `25081555-003`。
 * 没有数字后缀时兼容旧规则，追加三位流水号。
 */
export function expandConsecutiveBoardSerials(startSn: unknown, quantity: number) {
  const serial = getDisplayString(startSn)
  const count = Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0
  if (!serial || count <= 0) return []

  const trailingNumber = serial.match(/^(.*?)(\d+)$/)
  if (!trailingNumber) {
    return Array.from({ length: count }, (_, index) => `${serial}-${String(index + 1).padStart(3, "0")}`)
  }

  const [, prefix, numberText] = trailingNumber
  const start = Number(numberText)
  if (!Number.isSafeInteger(start)) {
    return Array.from({ length: count }, (_, index) => `${serial}-${String(index + 1).padStart(3, "0")}`)
  }

  return Array.from(
    { length: count },
    (_, index) => `${prefix}${String(start + index).padStart(numberText.length, "0")}`
  )
}

/** SN 回写阶段只重置申请单顶层状态，子板状态必须原样保留。 */
export function markCircuitApplicationPendingForSnPersistence<T extends object>(rows: T[]) {
  return rows.map((row) => ({
    ...row,
    status: 0 as const,
    dlbzt: 0 as const
  }))
}

function getRecordSerial(value: unknown) {
  const record = asRecord(value)
  return normalizeBoardSerial(
    getDisplayString(
      record.serial,
      record.sn,
      record.seria,
      record.serialNum,
      record.serial_num,
      record.serialNumber,
      record.board_serial,
      record.boardSerial,
      record.board_serialnumber,
      record.temp_board_serialnumber
    )
  )
}

function getExplicitLocalBoardIds(value: unknown, kind: LocalBoardIdKind) {
  const board = asRecord(value)
  const raw = asRecord(board.raw)
  const values =
    kind === "production"
      ? [board.prodBoardId, board.prod_board_id, raw.prodBoardId, raw.prod_board_id]
      : [board.tempBoardId, board.temp_board_id, raw.tempBoardId, raw.temp_board_id]
  return new Set(values.map((value) => getDisplayString(value)).filter(Boolean))
}

function getRowLocalBoardIds(value: unknown, kind: LocalBoardIdKind) {
  const row = asRecord(value)
  const values =
    kind === "production"
      ? [row.id, row.board_id, row.prodBoardId, row.prod_board_id]
      : [row.id, row.tempBoardId, row.temp_board_id]
  return values.map((value) => getDisplayString(value)).filter(Boolean)
}

/**
 * 本地实体匹配规则：先按标准化 SN 精确匹配；只有调用方明确提供了本地主键时才按 ID 回退。
 * board.id、boardId、board_id 可能是申请单行 ID 或小助手 ID，禁止参与本地主键匹配。
 */
export function findMatchingLocalBoardRow<T extends object>(
  rows: T[],
  board: unknown,
  kind: LocalBoardIdKind
): T | undefined {
  const raw = asRecord(asRecord(board).raw)
  const serial = getRecordSerial(board) || getRecordSerial(raw)
  if (serial) {
    return rows.find((row) => getRecordSerial(row) === serial)
  }

  // 仅兼容没有 SN 的旧记录；发布流程已要求补齐 SN，因此不会靠 ID 绕过 SN 校验。
  const explicitLocalIds = getExplicitLocalBoardIds(board, kind)
  if (!explicitLocalIds.size) return undefined
  return rows.find((row) => getRowLocalBoardIds(row, kind).some((id) => explicitLocalIds.has(id)))
}

export function formatMissingBoards(missingBoards: PublishCircuitModuleMissingBoard[]) {
  if (!missingBoards.length) return "未匹配到电路板，请检查批次号、SN、供应商名称和规格型号。"
  return missingBoards
    .map((board, index) => `${index + 1}. ${board.sn} / ${board.pch} / ${board.gysmc} / ${board.ggxh}`)
    .join("\n")
}
