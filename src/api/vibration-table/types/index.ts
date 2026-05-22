export type VibrationInstrument = {
  id?: number
  instrumentName: string
  snNumbers: string
  quantity: number
  weight?: string
  length?: string
  maxDiameter?: string
}

export type VibrationTableOrderListItem = {
  id: number
  tableNo: string
  taskNumber: string
  applicant: string
  applicantPhone?: string
  testApplicationUnit?: string
  testApplicationUnitManager?: string
  applicationDate?: string
  researchNumber?: string
  projectBudgetNumber?: string
  projectName?: string
  client?: string
  plannedTime?: string
  testPurpose?: string
  testType?: string
  vibrationDirection?: string
  level?: string
  acceleration?: string
  duration?: string
  slope?: string
  frequency?: string
  vibrationTimes?: number
  projectMembers?: string
  equipmentList?: string
  instrumentCombination?: string
  testSteps?: string
  safetyRisks?: string
  instrumentCount?: number
  instruments?: VibrationInstrument[]
  status: number
  statusText?: string
}

export type VibrationTableOrderDetail = VibrationTableOrderListItem & {
  instruments: VibrationInstrument[]
  createdAt?: string
  updatedAt?: string
}
