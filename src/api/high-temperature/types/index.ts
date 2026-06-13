export type HighTemperatureInstrument = {
  id?: number
  instrumentName: string
  snNumbers: string
  quantity: number
  instrumentStatus?: number
  isCompleted?: boolean
  completedAt?: string | null
}

export type HighTemperatureOrderListItem = {
  id: number
  taskNumber: string
  applicant: string
  applicantPhone?: string
  testApplicationUnit?: string
  applicationDate?: string
  researchNumber?: string
  projectBudgetNumber?: string
  projectName?: string
  specification?: string
  deviceName: string
  maxTemperature: number | string
  targetTemp: number | string
  slope?: string | number | null
  holdTime?: number | null
  humidity?: string | number | null
  status: number
  statusText?: string
  testDate?: string
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  instruments?: HighTemperatureInstrument[]
}

export type HighTemperatureOrderDetail = HighTemperatureOrderListItem & {
  testPlatform?: string
  runTime?: number
  deviceNumber?: string
  remark?: string
  feedbackReason?: string
  createdAt?: string
  updatedAt?: string
  instruments: HighTemperatureInstrument[]
}
