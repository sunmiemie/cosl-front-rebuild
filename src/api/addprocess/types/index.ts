export type upoloadfuncttestResponse = {
  code: 0
}

export type TestProcessListResponse = {
  code: 0
  data: Array<{
    ID: number
    type: string
    version: number
    status: number | string
  }>
}

export type TestProcessDetailResponse = {
  code: 0
  data: Array<{
    ID:  string
    type?: string
    version: string
    status:  number
    user: string
  }>
}

