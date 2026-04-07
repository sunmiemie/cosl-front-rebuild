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

export interface BoardTestTypeData {
  id: string | number
  name: string
  number: string
}

export interface BoardTestTypeResponseData {
  code: number
  message: string
  test_types: BoardTestTypeData[]
}
