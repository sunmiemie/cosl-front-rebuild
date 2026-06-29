/** 地点选项 */
export const LOCATION_OPTIONS = [
  { label: "YJ基地", value: "YJ基地" },
  { label: "塘沽基地", value: "塘沽基地" },
  { label: "湛江基地", value: "湛江基地" }
]

/** 刻度设备选项 */
export const CALIBRATION_DEVICE_OPTIONS = [
  { label: "刻度井", value: "刻度井" },
  { label: "Gal Jig 刻度架", value: "Gal Jig" }
]

/** 工单状态选项 */
export const STATUS_OPTIONS = [
  { label: "待处理", value: "pending" },
  { label: "已完成", value: "completed" }
] as const
