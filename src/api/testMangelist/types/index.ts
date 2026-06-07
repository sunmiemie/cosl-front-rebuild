import { UnwrapRef } from "vue"

type pathType = Array<{
  id: string
  label: string
  children?: pathType
}>

export type Code = {
  code: number
}

export type getTestMangePathType = {
  code: Code
  Pathdata: pathType
}

export type getBordsInfoType = {
  code: Code
  data: Array<{
    id: number
    serial_num: string
  }>
}

export type inpTestMangeTableDataType = {
  number?: string
  TestName?: string
  TestType?: string
  TestStatus?: string
  Daterange?: string
  boardName?: string
  boardModel?: string
  batchId?: string
  serial?: string
  supplier?: string
  currentPage?: any
  pageSize?: any
}

export type getTestMangeTableType = {
  total: number
  code: Code
  TableData: Array<{
    testunit_id?: number
    testunit_name?: string
    user_name?: string
    testunit_starttime?: string
    testunit_endtime?: string
    testunit_status?: string
    process_type?: string
    link?: any
  }>
}
// 发布测试工单参数
// export
