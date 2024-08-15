export interface CreateTestTypeRequestData {
  name: string
}

export interface UpdateTestTypeRequestData {
  id: string
  name: string
}

export interface GetTestTypeRequestData {
  currentPage: number
  size: number
  name?: string
}

export interface GetTestTypeData {
  number: string
  name: string
  processCount: string
}

export type GetTestTypeResponseData = ApiResponseData<{
  list: GetTestTypeData[]
  total: number
}>
