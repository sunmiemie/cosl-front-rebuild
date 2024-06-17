type InspectionStatus = "已巡检" | "未巡检" | "异常"

export type DailyInspection = {
  inspections: {
    [key: string]: InspectionStatus
  }
}
