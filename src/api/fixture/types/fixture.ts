export interface CreateFixtureRequestData {
  model: string
  seria: string
}

export interface UpdateFixtureRequestData {
  id: string
  model: string
  seria: string
}

export interface GetFixtureRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：序列号 */
  seria?: string
  /** 查询参数：型号 */
  model?: string
  /** 查询参数：状态 */
  status?: string
}

export interface GetFixtureData {
  startTime: string
  id: string
  name: string
  model: string
  seria: string
  status: string
  link?: any
}

export type GetFixtureResponseData = ApiResponseData<{
  list: GetFixtureData[]
  total: number
}>
