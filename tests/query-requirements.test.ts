import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")

const read = (path: string) => readFileSync(resolve(root, path), "utf8")

const expectContains = (file: string, snippets: string[]) => {
  const content = read(file)
  for (const snippet of snippets) {
    expect(content, `${file} should contain ${snippet}`).toContain(snippet)
  }
}

const expectSectionContains = (file: string, startSnippet: string, endSnippet: string, snippets: string[]) => {
  const content = read(file)
  const start = content.indexOf(startSnippet)
  expect(start, `${file} should contain section start ${startSnippet}`).toBeGreaterThanOrEqual(0)
  const end = content.indexOf(endSnippet, start)
  expect(end, `${file} should contain section end ${endSnippet}`).toBeGreaterThan(start)
  const section = content.slice(start, end)
  for (const snippet of snippets) {
    expect(section, `${file} section should contain ${snippet}`).toContain(snippet)
  }
}

describe("检验检测查询功能需求", () => {
  it("测试工艺列表可以筛出有工艺的电路板", () => {
    expectContains("src/views/testmanage/process/index.vue", [
      "onlyShowWithProcess",
      "filterTreeWithProcess",
      "仅显示有工艺"
    ])
  })

  it("测试工艺列表可以导出筛选后的有工艺电路板", () => {
    expectContains("src/views/testmanage/process/index.vue", [
      "downloadFilteredProcessBoards",
      "exportProcessTreeToExcel",
      "导出Excel"
    ])
  })

  it("生产和临时测试工单使用服务端多字段关键字查询", () => {
    for (const file of [
      "src/views/testmanage/testorder/components/ProdOrder.vue",
      "src/views/testmanage/testorder/components/TempOrder.vue"
    ]) {
      expectContains(file, [
        'label="关键字"',
        "searchData.keyword",
        "批次号",
        "序列号",
        "供应商",
        'label="创建时间范围"'
      ])
    }
  })

  it("疑问工单使用多字段关键字查询并保留追溯信息展示", () => {
    expectContains("src/views/testmanage/Questionlist/index.vue", [
      'label="关键字"',
      "searchData.keyword",
      "批次号",
      "序列号",
      "供应商",
      'label: "批次号"',
      'label: "电路板序列号"'
    ])
  })

  it("测试工单新增表单使用指定测试项目和测试内容下拉项", () => {
    for (const file of [
      "src/views/testmanage/testorder/components/ProdOrder.vue",
      "src/views/testmanage/testorder/components/temp_order/ProdBoard.vue",
      "src/views/testmanage/testorder/components/temp_order/TempBoard.vue"
    ]) {
      expectContains(file, [
        "testProjectOptions",
        "testContentOptions",
        'label="测试项目"',
        'label="测试内容"',
        "PCBA",
        "焊接质量"
      ])
    }
  })

  it("生产测试工单新增表单保留测试类型并新增测试项目和测试内容", () => {
    expectSectionContains(
      "src/views/testmanage/testorder/components/ProdOrder.vue",
      'title="新增生产测试工单"',
      "<template #footer>",
      [
        'label="测试类型"',
        "orderInfo.testType",
        'label="测试项目"',
        "orderInfo.testUnitType",
        'label="测试内容"',
        "orderInfo.testUnitDesc"
      ]
    )
  })

  it("报告列表支持批次号查询并展示批次号列", () => {
    for (const file of [
      "src/views/datamanage/historymange/components/ProdReport.vue",
      "src/views/datamanage/historymange/components/TempReport.vue",
      "src/views/datamanage/historymange/components/BugReport.vue"
    ]) {
      expectContains(file, ['label="批次号"', "searchData.batchId", 'label: "批次号"'])
    }

    expectContains("src/views/datamanage/historymange/components/BatchReport.vue", [
      'label="批次号"',
      "searchData.batchId"
    ])
  })

  it("具备审核状态的报告列表统一支持状态筛选", () => {
    for (const file of [
      "src/views/datamanage/historymange/components/ProdReport.vue",
      "src/views/datamanage/historymange/components/TempReport.vue"
    ]) {
      expectContains(file, ['label="报告状态"', "searchData.status", "status: searchData.status || undefined"])
    }

    for (const file of [
      "src/views/datamanage/historymange/components/WaterCycleReport.vue",
      "src/views/datamanage/historymange/components/HighTemperatureReport.vue",
      "src/views/datamanage/historymange/components/VibrationReport.vue",
      "src/views/datamanage/historymange/components/HighTemperaturePressureReport.vue"
    ]) {
      expectContains(file, ['label="审核状态"', "searchForm.status", "status: searchForm.status"])
    }

    expectContains("src/views/datamanage/historymange/components/HaltHassReport.vue", [
      'label="审核状态"',
      "searchForm.reviewStatus"
    ])
    expectContains("src/views/datamanage/historymange/components/SimulationWellReport.vue", [
      'label="审核状态"',
      "searchForm.status",
      ':data="tableData"'
    ])
  })
})
