// FirstLevelDirectory

export interface GetFirstLevelDirectoryRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
}

export interface FirstLevelDirectory {
  id: string
  name: string
}

export type GetFirstLevelDirectoryResponseData = ApiResponseData<{
  list: FirstLevelDirectory[]
  total: number
}>

export interface CreateFirstLevelDirectoryRequestData {
  name: string
}

// SecondLevelDirectory

export interface CreateSecondLevelDirectoryRequestData {
  name: string
  firstLevelDirectoryId: string
}

// Directory

export interface GetDirectoryRequestData {
  currentPage?: number
  size?: number
  name?: string
  id?: string
  isTree?: boolean
}

interface Directory {
  id: string
  name: string
}

export type GetDirectoryResponseData = ApiResponseData<{
  list: Directory[]
  total: number
}>

// QuestionItem

export interface GetQuestionItemRequestData {
  currentPage: number
  size: number
  secondLevelDirectoryId: string
}

export interface QuestionItem {
  id: string
  name: string
  question_desc: string
}

export type GetQuestionItemResponseData = ApiResponseData<{
  list: QuestionItem[]
  total: number
}>

export interface CreateQuestionItemRequestData {
  name: string
  question_desc: string
  secondLevelDirectoryId: string
}

export interface UpdateQuestionItemRequestData {
  id: string
  name: string
  question_desc: string
}
