// HALT-HASS 工艺相关类型定义

export interface BoardGroup {
  id: number
  name: string
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
  observeBlocks?: string[]
  runSettings?: RunSettings
}

export interface ProcessJson {
  metadata?: {
    name?: string
    version?: string
    description?: string
  }
  installGuide?: InstallGuide
  flowchart?: FlowchartData
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
export type HaltHassProcessSelectionType = "existing" | "other"

export interface HaltHassVersionItem {
  id: number
  name: string
  version: string
  status: number
  active: number
  createdAt: string
  experimentType?: HaltHassExperimentType | string
  experiment_type?: HaltHassExperimentType | string
  durationHours?: number | null
  duration_hours?: number | null
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
  processSelection?: HaltHassProcessSelectionType
  process_selection?: HaltHassProcessSelectionType
  otherProcessName?: string
  other_process_name?: string
  cycleCount?: number
  cycle_count?: number
  singleCycleDurationHours?: number
  single_cycle_duration_hours?: number
  totalCycleDurationHours?: number
  total_cycle_duration_hours?: number
  requiredRuntimeSeconds?: number
  required_runtime_seconds?: number
  elapsedRuntimeSeconds?: number
  elapsed_runtime_seconds?: number
  remainingRuntimeSeconds?: number
  remaining_runtime_seconds?: number
  runtimeProgress?: number
  runtime_progress?: number
  runtimeConfigured?: boolean
  runtime_configured?: boolean
  runtimeCompleted?: boolean
  runtime_completed?: boolean
  currentRunStartedAt?: string | null
  current_run_started_at?: string | null
}

export interface HaltHassOrderListItem extends HaltHassOrderBusinessFields {
  id: number
  orderNo: string
  boardGroup: HaltHassOrderBoardGroup | null
  process: HaltHassOrderProcess | null
  boardCount: number
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
  serial: string
  boardModel: BoardModelInGroup | null
  scanOrder: number
  scannedAt: string
}

export interface HaltHassOrderDetail extends HaltHassOrderBusinessFields {
  id: number
  orderNo: string
  boardGroup: HaltHassOrderBoardGroup | null
  boardsInGroup: BoardModelInGroup[]
  process: (HaltHassOrderProcess & { content?: string }) | null
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
  boardGroupId: number
  processId?: number | null
  boardCount: number
  creatorId: number
  cycleCount: number
  board_group_id?: number
  process_id?: number | null
  board_count?: number
  creator_id?: number
  cycle_count: number
  singleCycleDurationHours?: number
  single_cycle_duration_hours?: number
  remark?: string
  boardSerials?: Array<{
    serial: string
    boardModelId: number
  }>
  board_serials?: Array<{
    serial: string
    board_model_id: number
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
  processSelection: HaltHassProcessSelectionType
  process_selection: HaltHassProcessSelectionType
  otherProcessName?: string
  other_process_name?: string
}

// ==================== HALT-HASS 报告类型 ====================

export interface HaltHassReportOrder {
  id: number
  orderNo: string
}

export interface HaltHassReportListItem {
  id: number
  order: HaltHassReportOrder | null
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
  boards: Array<{
    serial: string
    boardModelId?: number
    boardModelName?: string
  }>
  startTime: string
  endTime: string
  duration: number
  flowchartResult: FlowchartResultData
  remark?: string
}

export interface HaltHassReportDetail {
  id: number
  order: HaltHassReportDetailOrder | null
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
