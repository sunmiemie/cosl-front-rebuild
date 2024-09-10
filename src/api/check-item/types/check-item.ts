// 一级目录

export interface FirstLevelDirectory {
  id: number
  name: string
}

export type GetFirstLevelDirectoryResponseData = ApiResponseData<FirstLevelDirectory[]>

// 二级目录
export interface CreateSecondLevelDirectoryRequestData {
  secondLevelDirectoryName: string
  firstLevelDirectoryId: number
}

// 目录

interface Directory {
  id: string
  name: string
}

export type GetDirectoryResponseData = ApiResponseData<Directory[]>

// 检测项

export interface GetCheckItemRequestData {
  currentPage?: number
  pageSize?: number
  secondLevelDirectoryId: number
}

export interface CheckItem {
  id: number
  name: string
  operation_desc: string
}

export type GetCheckItemResponseData = ApiResponseData<{
  list: CheckItem[]
  total: number
}>

export interface CreateCheckItemRequestData {
  name: string
  operation_desc: string
  secondLevelDirectoryId: number
}

export interface UpdateCheckItemRequestData {
  id: number
  name: string
  operation_desc: string
}
