export type EngineerAssistantBaseResponse<T> = {
  code: number
  msg?: string
  data: T
}

export type EngineerAssistantListData<T> = {
  list: T[]
  total: number
  source?: string
}

export type EngineerAssistantUser = {
  id: string
  userId: string
  name: string
  userName: string
  departmentId?: string
  departmentName?: string
  raw?: unknown
}

export type EngineerAssistantTestType = {
  id: string
  number?: string
  typeId: string
  name: string
  typeName: string
  raw?: unknown
}

export type EngineerAssistantTestStatus = {
  value: string
  label: string
  lable?: string
  raw?: unknown
}

export type EngineerAssistantApplicationForm = {
  testId: string
  testType: string
  testTypeName?: string
  status?: string
  zt?: string
  baseInfo?: unknown
  instruments?: unknown[]
  devices?: unknown[]
  users?: unknown[]
  raw?: unknown
}

export type GetEngineerAssistantUsersResponse = EngineerAssistantBaseResponse<
  EngineerAssistantListData<EngineerAssistantUser>
>
export type GetEngineerAssistantTestTypesResponse = EngineerAssistantBaseResponse<
  EngineerAssistantListData<EngineerAssistantTestType>
>
export type GetEngineerAssistantTestStatusesResponse = EngineerAssistantBaseResponse<
  EngineerAssistantListData<EngineerAssistantTestStatus>
>
export type GetEngineerAssistantApplicationFormsResponse = EngineerAssistantBaseResponse<
  EngineerAssistantListData<EngineerAssistantApplicationForm>
>
export type GetEngineerAssistantApplicationFormDetailResponse =
  EngineerAssistantBaseResponse<EngineerAssistantApplicationForm>

export type PushEngineerAssistantProcessesBody = {
  processDtoList: Array<{
    testTypeId: string
    testTypeName: string
    list: Array<{
      processId: string
      processName: string
      processDescription: string
    }>
  }>
}

export type PushEngineerAssistantEquipmentBody = {
  testEquipmentDtoList: Array<{
    testTypeId: string
    equipmentId: string
    equipmentName: string
  }>
}

export type EngineerAssistantScheduleInfo = {
  testId: string
  testType: string
  equipmentId: string
  startTime: string
  endTime: string
}

export type PushEngineerAssistantSchedulesBody = {
  schedulesInfo: EngineerAssistantScheduleInfo[]
}

export type ChangeEngineerAssistantStatusBody = {
  testType: string
  id: string
  status: string
  description: string
}

export type PushEngineerAssistantReportsBody = {
  testReportList: Array<{
    id: string
    testType: string
    status: string
    data: Array<{
      filename: string
      equipmentId: string
      fileContent: string
      description: string
      status: string
    }>
  }>
}
