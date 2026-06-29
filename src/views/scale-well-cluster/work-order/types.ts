/** 工单状态 */
export type WorkOrderStatus = "pending" | "completed"

/** 伽马刻度工单 */
export interface CalibrationWorkOrder {
  /** 任务单号 */
  id: string
  /** 仪器型号（内部 key） */
  toolType: string
  /** 仪器 SN */
  serialNumber: string
  /** 测试人员 */
  engineer: string
  /** 地点 */
  location: string
  /** 刻度设备 */
  calibrationDevice: string
  /** 高刻井 */
  hiWell: string
  /** 低刻井 */
  loWell: string
  /** 高刻 API */
  hiApi: number
  /** 低刻 API */
  loApi: number
  /** 备注 */
  remark: string
  /** 计划日期 */
  planDate: string
  /** 状态 */
  status: WorkOrderStatus
  /** 刻度结果 Kc（完成后填写） */
  kc: number | null
}

/** 新建/编辑表单 */
export interface WorkOrderFormModel {
  toolType: string
  serialNumber: string
  engineer: string
  location: string
  calibrationDevice: string
  hiWell: string
  loWell: string
  hiApi: number | null
  loApi: number | null
  remark: string
  planDate: string
}

/** 列表筛选 */
export interface WorkOrderFilter {
  keyword: string
  status: WorkOrderStatus | ""
  toolType: string
}
