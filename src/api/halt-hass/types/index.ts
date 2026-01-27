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
  stepNo: number
  title: string
  description: string
  mediaType: "image" | "video"
  mediaUrl: string
}

export interface InstallGuide {
  title: string
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
}

export interface FlowchartData {
  nodes: FlowchartNode[]
  edges: FlowchartEdge[]
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
  active: number
  createdAt: string
}

export interface HaltHassVersionListResponse {
  code: number
  data: HaltHassVersionItem[]
}
