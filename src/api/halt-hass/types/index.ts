// HALT-HASS 工艺相关类型定义

export interface BoardGroup {
  id: number
  name: string
}

export interface HaltHassApplicableBoardModel {
  id: number
  name: string
  code?: string
}

export interface HaltHassProductModel {
  id: number
  name: string
}

export type HaltHassClientTestType = 1 | 2
export type HaltHassReportType = "drive_control" | "rectifier_regulator"

export interface RectifierProcessConfig {
  inputVoltageSteps: number[]
  sourceCurrentLimitA: number
  voltageSettleSeconds: number
  halfLoadSettleSeconds: number
  fullLoadSettleSeconds: number
  halfLoad: { load48Ohm: number; load90Ohm: number }
  fullLoad: { load48Ohm: number; load90Ohm: number }
  output48VoltageRange: { min: number; max: number }
  output90VoltageRange: { min: number; max: number }
  currentUnit: "A"
}

export interface HaltHassProductOption extends HaltHassProductModel {
  haltHassTestType?: HaltHassClientTestType | null
  haltHassTestTypeName?: string
}

export interface HaltHassAssemblySlot {
  slotNo: number
  name: string
  required: boolean
  allowCompanion: boolean
  allowedBoardModelIds: number[]
}

export interface HaltHassAssemblyRule {
  slotCount: number
  minimumTargetBoards: number
  allowCompanionBoards: boolean
  allowEmptySlots: boolean
  slots: HaltHassAssemblySlot[]
}

export interface HaltHassProcessListItem {
  id: number
  name: string
  version: string
  status: number
  boardGroups: BoardGroup[]
  createdAt: string
  userName: string
  auditNum: number
  active: number
  productModel?: HaltHassProductModel | null
  productModelId?: number | null
  clientTestType?: HaltHassClientTestType | null
  clientTestTypeName?: string
}

export interface HaltHassProcessListResponse {
  code: number
  data: {
    list: HaltHassProcessListItem[]
    total: number
    currentPage: number
    pageSize: number
  }
}

export interface InstallGuideStep {
  id: number
  title: string
  content: string
  images: string[]
  video?: string
}

export interface InstallGuide {
  steps: InstallGuideStep[]
}

export interface FlowchartNode {
  id: string
  type: string
  data: Record<string, any>
  position: { x: number; y: number }
}

export interface FlowchartEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface RunSettings {
  nodeDelay: number
  maximumRuntime: number
  maximumConcurrentWorkers: number
}

export interface FlowchartData {
  nodes: FlowchartNode[]
  edges: FlowchartEdge[]
  observeBlocks: string[]
  runSettings: RunSettings
}

export interface ProcessJson {
  schemaVersion: 2
  metadata: {
    name?: string
    version?: string
    description?: string
    productModel?: HaltHassProductModel | null
    experimentMode?: "halt" | "hass" | ""
    applicableBoardModels?: HaltHassApplicableBoardModel[]
    assemblyRule?: HaltHassAssemblyRule
    reportType?: HaltHassReportType
    rectifierConfig?: RectifierProcessConfig
  }
  installGuide: InstallGuide
  testFlow: FlowchartData
  cycleFlow: FlowchartData
}

export interface HaltHassProcessDetail {
  id: number
  name: string
  version: string
  status: number
  boardGroups: BoardGroup[]
  createdAt: string
  userName: string
  processJson: ProcessJson | null
  feedback: string[]
  auditNum: number
  active: number
  productModel?: HaltHassProductModel | null
  productModelId?: number | null
  clientTestType?: HaltHassClientTestType | null
  clientTestTypeName?: string
}

export interface HaltHassProcessDetailResponse {
  code: number
  data: HaltHassProcessDetail
}

export interface HaltHassProcessCreateParams {
  name: string
  version: string
  boardGroupIds: number[]
  processJson: ProcessJson
  userId: number
}

export interface HaltHassProcessUpdateParams {
  name?: string
  version?: string
  boardGroupIds?: number[]
  processJson?: ProcessJson
}

export type HaltHassExperimentType = "halt" | "hass"
export type HaltHassCircuitBoardStatus = "development" | "fault_excitation" | "manufacturing"
export interface HaltHassVersionItem {
  id: number
  name: string
  version: string
  status: number
  active: number
  createdAt: string
  experimentType?: HaltHassExperimentType | string
  experiment_type?: HaltHassExperimentType | string
  productModel?: HaltHassProductModel | null
  productModelId?: number | null
  clientTestType?: HaltHassClientTestType | null
  clientTestTypeName?: string
}

export interface HaltHassVersionListResponse {
  code: number
  data: HaltHassVersionItem[]
}

// ==================== HALT-HASS 工单类型 ====================

export interface HaltHassOrderBoardGroup {
  id: number
  name: string
}

export interface HaltHassOrderProcess {
  id: number
  name: string
  version: string
}

export interface HaltHassOrderBusinessFields {
  productModel?: HaltHassProductModel | null
  product_model?: HaltHassProductModel | null
  instrumentModel?: HaltHassProductModel | null
  instrument_model?: HaltHassProductModel | null
  clientTestType?: HaltHassClientTestType | null
  client_test_type?: HaltHassClientTestType | null
  clientTestTypeName?: string
  client_test_type_name?: string
  taskExecutionDescription?: string
  task_execution_description?: string
  testApplicationUnit?: string
  test_application_unit?: string
  researchNumber?: string
  research_number?: string
  projectBudgetNumber?: string
  project_budget_number?: string
  projectName?: string
  project_name?: string
  address?: string
  applicant?: string
  phone?: string
  mobile?: string
  experimentType?: HaltHassExperimentType | string
  experiment_type?: HaltHassExperimentType | string
  circuitBoardStatus?: HaltHassCircuitBoardStatus | string
  circuit_board_status?: HaltHassCircuitBoardStatus | string
  cycleCount?: number
  cycle_count?: number
  workbenchTestName?: string
  workbench_test_name?: string
}

export interface HaltHassOrderListItem extends HaltHassOrderBusinessFields {
  id: number
  orderNo: string
  boardGroup: HaltHassOrderBoardGroup | null
  boardCount: number
  targetBoardProgress?: HaltHassTargetBoardProgress
  status: number
  statusText: string
  creatorId: number | null
  operatorId: number | null
  createdAt: string
  startedAt: string
  completedAt: string
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduleSegments?: Array<{
    scheduled_start_at: string
    scheduled_end_at: string
  }>
  remark: string
}

export interface HaltHassOrderListResponse {
  code: number
  data: {
    list: HaltHassOrderListItem[]
    total: number
    page: number
    pageSize: number
  }
}

export interface BoardModelInGroup {
  id: number
  name: string
  code: string
}

export interface ScannedBoard {
  id: number
  serial: string
  boardModel: BoardModelInGroup | null
  boardModelId?: number | null
  boardModelName?: string
  boardModelCode?: string
  status: number
  statusText: string
  attemptNo: number
  scanOrder: number
  scannedAt: string | null
  completedAt?: string | null
  failureReason?: string
}

export interface HaltHassTargetBoardProgress {
  total: number
  pending: number
  testing: number
  reviewing: number
  passed: number
  redo: number
  abnormal: number
  question: number
}

export interface HaltHassOrderDetail extends HaltHassOrderBusinessFields {
  id: number
  orderNo: string
  boardGroup: HaltHassOrderBoardGroup | null
  boardsInGroup: BoardModelInGroup[]
  boardCount: number
  boardSerials: string[]
  scannedBoards: ScannedBoard[]
  status: number
  statusText: string
  creatorId: number | null
  operatorId: number | null
  createdAt: string
  startedAt: string
  completedAt: string
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduleSegments?: Array<{
    scheduled_start_at: string
    scheduled_end_at: string
  }>
  feedbackReason: string
  remark: string
}

export interface HaltHassOrderDetailResponse {
  code: number
  data: HaltHassOrderDetail
}

export interface HaltHassOrderCreateParams {
  productModelId: number
  product_model_id?: number
  instrumentModelId?: number | null
  instrument_model_id?: number | null
  boardGroupId: number
  boardCount: number
  creatorId: number
  cycleCount: number
  board_group_id?: number
  board_count?: number
  creator_id?: number
  cycle_count: number
  taskExecutionDescription: string
  task_execution_description: string
  workbenchTestName: string
  workbench_test_name: string
  remark?: string
  boardSerials?: Array<{
    serial: string
    boardModelId: number
    boardModelName?: string
    boardModelCode?: string
  }>
  board_serials?: Array<{
    serial: string
    board_model_id: number
    board_model_name?: string
    board_model_code?: string
  }>
  testApplicationUnit: string
  test_application_unit: string
  researchNumber: string
  research_number: string
  projectBudgetNumber: string
  project_budget_number: string
  projectName: string
  project_name: string
  address: string
  applicant: string
  phone: string
  mobile: string
  experimentType: HaltHassExperimentType
  experiment_type: HaltHassExperimentType
  circuitBoardStatus: HaltHassCircuitBoardStatus
  circuit_board_status: HaltHassCircuitBoardStatus
}

export interface HaltHassOrderOptionsResponse {
  code: number
  msg?: string
  data: {
    productModel: HaltHassProductModel
    instrumentModel?: HaltHassProductModel | null
    clientTestType: HaltHassClientTestType
    clientTestTypeName: string
    processes: HaltHassVersionItem[]
  }
}

// ==================== HALT-HASS 报告类型 ====================

export interface HaltHassReportOrder {
  id: number
  orderNo: string
}

export interface HaltHassReportListItem {
  id: number
  reportNo: string | null
  reportType?: HaltHassReportType
  order: HaltHassReportOrder | null
  sessionId: number | null
  sessionNo: string
  targetBoardId: number | null
  serial: string
  boardModelName: string
  boardModelCode: string
  attemptNo: number
  isCurrent: boolean
  result: number
  resultText: string
  operatorId: number | null
  reviewerId: number | null
  reviewStatus: number
  reviewStatusText: string
  reviewTime: string
  reviewComment: string
  createdAt: string
}

export interface HaltHassReportListResponse {
  code: number
  data: {
    list: HaltHassReportListItem[]
    total: number
    page: number
    pageSize: number
  }
}

export interface HaltHassReportDetailOrder {
  id: number
  orderNo: string
  boardGroup: HaltHassOrderBoardGroup | null
  process: HaltHassOrderProcess | null
  boardCount: number
  boardSerials: string[]
}

export interface FlowchartResultData {
  totalNodes: number
  successNodes: number
  failedNodes: number
  nodeResults: Array<{
    nodeId: string
    nodeName: string
    status: string
    error?: string
    data?: Record<string, any>
  }>
}

export interface HaltHassReportJson {
  orderNo: string
  reportType?: HaltHassReportType
  currentUnit?: "A" | "mA"
  boards: Array<{
    serial: string
    boardModelId?: number
    boardModelName?: string
    boardModelCode?: string
    role?: "target" | "companion"
    slotNo?: number
  }>
  startTime: string
  endTime: string
  duration: number
  flowchartResult: FlowchartResultData
  remark?: string
  reportSubject?: {
    targetBoardId: number
    targetSerial: string
    targetBoardModel: string
  }
  scannedBoardSummary?: {
    scannedBoardCount: number
    testedTargetBoardCount: number
    nonTargetBoardCount: number
  }
  periodicRecords?: Array<{
    intervalIndex: number
    recordedAt: string
    elapsedSeconds: number
    isPartialInterval: boolean
    temperature: number | null
    vibration: number | null
    communications: {
      interfaceBoard: "正常" | "异常" | "不适用"
      controlBoard: "正常" | "异常" | "不适用"
      storageBoard: "正常" | "异常" | "不适用"
    }
    pulserSummary: "正常" | "异常"
    current48v: number | null
    current90v: number | null
    missingReasons: string[]
  }>
  chartImages?: Array<{
    chartType: "pulser" | "temperature" | "vibration" | "current"
    title: string
    fileName: string
    mimeType: string
    startAt: string
    endAt: string
    checksum: string
    rendererVersion: string
    fileUrl?: string
    size?: number
  }>
  rectifierReport?: {
    currentUnit: "A"
    stages: Array<{
      stageIndex: number
      stageIdentity: string
      targetTemperature: number | null
      actualTemperature: number | null
      targetVibration: number | null
      actualVibration: number | null
      startedAt: string
      completedAt: string
      voltageSteps: Array<{
        inputVoltage: number
        voltageChangedAt: string
        halfLoad: RectifierLoadRecord
        fullLoad: RectifierLoadRecord
      }>
    }>
    boardConclusions: RectifierBoardConclusion[]
  }
}

export type HaltHassPassResult = "合格" | "不合格"

export interface RectifierResultReview {
  originalResult: HaltHassPassResult
  result: HaltHassPassResult
  modifiedBy?: number
  modifiedAt?: string
}

export interface RectifierLoadRecord {
  load48Ohm: number
  load90Ohm: number
  output48Voltage: number | null
  output48CurrentA: number | null
  output90Voltage: number | null
  output90CurrentA: number | null
  output48Result: RectifierResultReview
  output90Result: RectifierResultReview
  recordedAt: string
  missingReasons: string[]
}

export interface RectifierBoardConclusion extends RectifierResultReview {
  serial: string
  boardModelId?: number
  boardModelName: string
  boardModelCode?: string
  role: "target" | "companion"
  slotNo: number
}

export interface HaltHassReportDetail {
  id: number
  reportNo: string | null
  reportType?: HaltHassReportType
  order: HaltHassReportDetailOrder | null
  sessionId: number | null
  sessionNo: string
  targetBoardId: number | null
  serial: string
  boardModelName: string
  boardModelCode: string
  attemptNo: number
  isCurrent: boolean
  reportJson: HaltHassReportJson
  result: number
  resultText: string
  operatorId: number | null
  reviewerId: number | null
  reviewStatus: number
  reviewStatusText: string
  reviewTime: string
  reviewComment: string
  createdAt: string
}

export interface HaltHassReportDetailResponse {
  code: number
  data: HaltHassReportDetail
  msg?: string
}
