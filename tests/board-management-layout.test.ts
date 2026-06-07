import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("电路板管理页面固定布局", () => {
  it("页面外层固定在视口内", () => {
    const content = read("src/views/devicemanage/device/boards/index.vue")

    expect(content).toContain("board-manage-page")
    expect(content).toContain("board-manage-card")
    expect(content).toContain("board-manage-tabs")
    expect(content).toContain("> .el-tabs__header")
    expect(content).toContain("order: 0")
    expect(content).toContain("order: 1")
  })

  it("生产和临时电路板页签左树和右侧结果区分别滚动", () => {
    for (const file of [
      "src/views/devicemanage/device/boards/components/ProdBoard.vue",
      "src/views/devicemanage/device/boards/components/TempBoard.vue"
    ]) {
      const content = read(file)

      expect(content).toContain("board-layout")
      expect(content).toContain("board-tree-card")
      expect(content).toContain("tree-scrollbar")
      expect(content).toContain("board-result")
      expect(content).toContain("board-table-card")
      expect(content).toContain("board-table-scroll")
      expect(content).toContain("table-scroll-region")
      expect(content).toContain("board-data-table")
      expect(content).toContain('height="100%"')
      expect(content).toContain("overflow: hidden")
      expect(content).toContain("scrollbar-gutter: stable")
    }
  })
})
