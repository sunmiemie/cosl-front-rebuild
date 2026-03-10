import { reactive } from "vue"

interface DefaultPaginationData {
  total: number
  currentPage: number
  pageSizes: number[]
  pageSize: number
  layout: string
}

interface PaginationData {
  total?: number
  currentPage?: number
  pageSizes?: number[]
  pageSize?: number
  layout?: string
}

/** 默认的分页参数 */
const defaultPaginationData: DefaultPaginationData = {
  total: 0,
  currentPage: 1,
  pageSizes: [10, 20, 50],
  pageSize: 10,
  layout: "total, sizes, prev, pager, next, jumper"
}

export function usePagination(initialPaginationData: PaginationData = {}) {
  /** 合并分页参数 */
  const paginationData = reactive({
    ...defaultPaginationData,
    ...initialPaginationData,
    pageSizes: [...(initialPaginationData.pageSizes ?? defaultPaginationData.pageSizes)]
  })
  /** 改变当前页码 */
  const handleCurrentChange = (value: number) => {
    paginationData.currentPage = value
  }
  /** 改变页面大小 */
  const handleSizeChange = (value: number) => {
    paginationData.pageSize = value
    paginationData.currentPage = 1
  }

  return { paginationData, handleCurrentChange, handleSizeChange }
}

export function useDetailPagination(initialPaginationData: PaginationData = {}) {
  /** 合并分页参数 */
  const paginationDetailData = reactive({
    ...defaultPaginationData,
    ...initialPaginationData,
    pageSizes: [...(initialPaginationData.pageSizes ?? defaultPaginationData.pageSizes)]
  })
  /** 改变当前页码 */
  const handleDetailCurrentChange = (value: number) => {
    paginationDetailData.currentPage = value
  }
  /** 改变页面大小 */
  const handleDetailSizeChange = (value: number) => {
    paginationDetailData.pageSize = value
    paginationDetailData.currentPage = 1
  }

  return { paginationDetailData, handleDetailCurrentChange, handleDetailSizeChange }
}
