/** 工单状态（0-8） */
export type WorkOrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

/** 伽马刻度工单 */
export interface CalibrationWorkOrder {
  id: number
  taskNumber: string
  modelId: number
  modelName: string
  serialNumber: string
  testerId: number | null
  engineer: string
  location: string
  calibrationDevice: string
  hiWell: string
  loWell: string
  hiApi: number
  loApi: number
  remark: string
  planDate: string
  status: WorkOrderStatus
  statusText: string
  kc: number | null
}

/** 新建/编辑表单 */
export interface WorkOrderFormModel {
  modelId: number | null
  serialNumber: string
  testerId: number | null
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
  status: WorkOrderStatus | "" | number
  modelId: number | ""
}
