export interface CreateFixtureModelRequestData {
    name: string
    type: string
    des: string
  }
  
  export interface UpdateFixtureModelRequestData {
    id: string
    name: string
    type: string
    des: string
    number: string
  }
  
  export interface GetFixtureModelRequestData {
    /** 当前页码 */
    currentPage: number
    /** 查询条数 */
    size: number
    /** 查询参数：名称 */
    name?: string
    /** 查询参数：ID */
    id?: string
  }
  
  export interface GetFixtureModelData {
    id: string
    name: string
    type: string
    des: string
  }
  
  export type GetFixtureModelResponseData = ApiResponseData<{
    list: GetFixtureModelData[]
    total: number
  }>
  