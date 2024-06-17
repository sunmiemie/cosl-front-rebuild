export interface CreateBoardModelRequestData {
  name: string
  // instrument: string
  des: string
  // type: string
  model: string
}

export interface UpdateBoardModelRequestData {
  id: string
  name: string
  des: string
  checkList: string
}

export interface GetBoardModelRequestData {
  currentPage: number
  size: number
  name?: string
  id?: string
  instrument?: string
}

export interface GetBoardModelData {
  id: string
  name: string
  batch: string
  des: string,
  instrument_data: Array<any>
}

export type GetBoardModelResponseData = ApiResponseData<{
  list: GetBoardModelData[]
  total: number
}>
