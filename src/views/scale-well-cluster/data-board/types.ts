/** 统计卡片趋势类型 */
export type StatTrendType = "up" | "down" | "neutral"

/** 近期刻度工单（看板列表） */
export interface DashboardRecentOrder {
  taskNumber: string
  modelName: string
  engineer: string
  status: number
  statusText: string
  kc: number | null
  planDate: string
}

/** 顶部统计卡片 */
export interface StatSummaryItem {
  key: string
  label: string
  value: number
  unit: string
  icon: string
  trendText: string
  trendType: StatTrendType
}

/** 仪器 Kc 图表配置 */
export interface InstrumentKcConfig {
  model: "475" | "675" | "800"
  title: string
  kcMin: number
  kcMax: number
  values: number[]
}
