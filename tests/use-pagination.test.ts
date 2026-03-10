import { describe, expect, it } from "vitest"
import { useDetailPagination, usePagination } from "@/hooks/usePagination"

describe("分页状态", () => {
  it("不同列表和调用方的页容量选项互不影响", () => {
    const first = usePagination()
    const second = useDetailPagination()
    first.paginationData.pageSizes.push(100)
    expect(second.paginationDetailData.pageSizes).toEqual([10, 20, 50])
    const pageSizes = [5, 10]
    usePagination({ pageSizes }).paginationData.pageSizes.push(20)
    expect(pageSizes).toEqual([5, 10])
  })

  it("更改页容量后回到首页，避免继续请求超出范围的页码", () => {
    const main = usePagination({ currentPage: 8 })
    const detail = useDetailPagination({ currentPage: 6 })
    main.handleSizeChange(50)
    detail.handleDetailSizeChange(20)
    expect(main.paginationData).toMatchObject({ currentPage: 1, pageSize: 50 })
    expect(detail.paginationDetailData).toMatchObject({ currentPage: 1, pageSize: 20 })
    main.handleCurrentChange(3)
    detail.handleDetailCurrentChange(2)
    expect(main.paginationData.currentPage).toBe(3)
    expect(detail.paginationDetailData.currentPage).toBe(2)
  })
})
