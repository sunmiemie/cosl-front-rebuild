export type SensorlessOvenOrderListItem = {
  id: number
  taskNumber: string
  applicant: string
  testApplicationUnit?: string
  projectName?: string
  specification?: string
  maxTemperature: number | string | null
  status: number
  statusText?: string
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduleSegments?: any[]
}

export type SensorlessOvenOrderDetail = SensorlessOvenOrderListItem & {
  instrumentName?: string
  snNumbers?: string
  createdAt?: string
  updatedAt?: string
}
