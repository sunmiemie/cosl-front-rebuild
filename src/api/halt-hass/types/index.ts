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

export interface HaltHassVersionItem {
  id: number
  name: string
  version: string
  status: number
  active: number
  createdAt: string
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

export interface HaltHassOrderListItem {
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

export interface HaltHassOrderDetail {
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
  feedbackReason: string
  remark: string
}

export interface HaltHassOrderDetailResponse {
  code: number
  data: HaltHassOrderDetail
}

export interface HaltHassOrderCreateParams {
  boardGroupId: number
  processId: number
  boardCount: number
  creatorId: number
  remark?: string
  boardSerials?: Array<{
    serial: string
    boardModelId: number
  }>
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
