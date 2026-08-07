import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  expandConsecutiveBoardSerials,
  findMatchingLocalBoardRow,
  getGeneratedOrderType,
  isSameCircuitApplicationBoardRecord,
  markCircuitApplicationPendingForSnPersistence,
  mapDlbBoardToUiBoard,
  resolveCraftFlagValue
} from "../src/views/testmanage/circuit-module-inspection/components/circuit-application-helpers"

const root = resolve(__dirname, "..")
const componentContent = readFileSync(
  resolve(root, "src/views/testmanage/circuit-module-inspection/components/CircuitBoardModule.vue"),
  "utf8"
).replace(/\r\n/g, "\n")
const apiContent = readFileSync(resolve(root, "src/api/circuit-module-application/index.ts"), "utf8").replace(
  /\r\n/g,
  "\n"
)

describe("电路板申请单发布匹配", () => {
  it("回写 SN 时只匹配板级稳定 ID，不使用共享的 dlbTestId", () => {
    const target = {
      id: "162",
      boardId: "162",
      sn: "CS20260807001-001",
      raw: { id: "162", boardId: "162", dlbTestId: "40", sn: "CS20260807001-001" }
    }
    const sibling = {
      id: "163",
      boardId: "163",
      dlbTestId: "40",
      sn: "MD150-018"
    }

    expect(isSameCircuitApplicationBoardRecord(target, target.raw)).toBe(true)
    expect(isSameCircuitApplicationBoardRecord(target, { assistantBoardId: "162", dlbTestId: "40" })).toBe(true)
    expect(isSameCircuitApplicationBoardRecord(target, sibling)).toBe(false)
    expect(isSameCircuitApplicationBoardRecord({ sn: "LEGACY-001" }, { serial: "legacy-001" })).toBe(true)
    expect(isSameCircuitApplicationBoardRecord({ id: "162", sn: "SAME" }, { id: "163", sn: "SAME" })).toBe(false)
  })

  it("按起始 SN 末尾序号连续展开批量电路板", () => {
    expect(expandConsecutiveBoardSerials("25081555-001", 10)).toEqual([
      "25081555-001",
      "25081555-002",
      "25081555-003",
      "25081555-004",
      "25081555-005",
      "25081555-006",
      "25081555-007",
      "25081555-008",
      "25081555-009",
      "25081555-010"
    ])
  })

  it("补录 SN 先以待发布状态同步成功，再继续自动补板", () => {
    const confirmBlock = componentContent.match(
      /async function confirmSnFill\(\) \{([\s\S]*?)function openSnFillDialog/
    )?.[1]
    expect(confirmBlock).toBeTruthy()
    expect(confirmBlock).toContain("await syncCircuitModuleApplicationList(nextRows)")
    expect(confirmBlock).toContain("snFillResolver?.(true)")
    expect(confirmBlock?.indexOf("await syncCircuitModuleApplicationList(nextRows)")).toBeLessThan(
      confirmBlock?.indexOf("snFillResolver?.(true)") ?? -1
    )
    expect(confirmBlock?.indexOf("catch (error)")).toBeLessThan(
      confirmBlock?.indexOf("snFillSaving.value = false") ?? -1
    )

    const persistenceBlock = componentContent.match(
      /function buildSnPersistenceRows[\s\S]*?function normalizeSnInput/
    )?.[0]
    expect(persistenceBlock).toContain("markCircuitApplicationPendingForSnPersistence(nextRows)")
    expect(persistenceBlock).not.toContain("publishStatus: 0")
    expect(persistenceBlock).not.toContain("row.boards.map")

    const publishBlock = componentContent.match(
      /async function publishApplication[\s\S]*?async function publishBoard/
    )?.[0]
    expect(publishBlock?.indexOf("await ensurePublishBoardsHaveSn")).toBeLessThan(
      publishBlock?.indexOf("await generateOrdersForBoards") ?? -1
    )
  })

  it("部分发布申请单回写 SN 时保留兄弟板发布状态", () => {
    const boards = [
      { id: 1, sn: "PUBLISHED-001", status: 1, publishStatus: 1 },
      { id: 2, sn: "DRAFT-001", status: 0, publishStatus: 0 }
    ]
    const [row] = markCircuitApplicationPendingForSnPersistence([{ orderNo: "CS-001", status: 1, dlbzt: 1, boards }])

    expect(row.status).toBe(0)
    expect(row.dlbzt).toBe(0)
    expect(row.boards).toEqual(boards)
    expect(row.boards[0]).toMatchObject({ status: 1, publishStatus: 1 })
  })

  it("缺少是否需要检测工艺时安全生成临时工单，且保留接口显式值", () => {
    expect(resolveCraftFlagValue(undefined, undefined)).toBe("否")
    expect(getGeneratedOrderType(resolveCraftFlagValue(undefined, undefined))).toBe("temporary")
    expect(componentContent.match(/sfxyjcgy: createForm\.sfxyjcgy/g)).toHaveLength(2)
    expect(resolveCraftFlagValue("是", "否")).toBe("是")
    expect(resolveCraftFlagValue("待确认", "是")).toBe("待确认")
    expect(getGeneratedOrderType("待确认")).toBe("temporary")
  })

  it("优先按标准化 SN 匹配本地实体", () => {
    const rows = [
      { id: 101, serial_num: "MD150-019" },
      { id: 102, serial_num: "MD150-020" }
    ]

    expect(findMatchingLocalBoardRow(rows, { serial: "md150-０１９", boardId: 102 }, "production")).toEqual(rows[0])
  })

  it("外部 boardId、board_id 和申请单行 id 不得冒充本地生产板主键", () => {
    const rows = [{ id: 32, serial_num: "LOCAL-SN" }]

    expect(
      findMatchingLocalBoardRow(
        rows,
        { id: 32, boardId: 32, board_id: 32, serial: "ASSISTANT-SN", raw: { board_id: 32 } },
        "production"
      )
    ).toBeUndefined()
    expect(findMatchingLocalBoardRow(rows, { serial: "ASSISTANT-SN", prodBoardId: 32 }, "production")).toBeUndefined()
    expect(findMatchingLocalBoardRow(rows, { prodBoardId: 32 }, "production")).toEqual(rows[0])
  })

  it("小助手 board_id 映射时只保留为外部 ID，不推断为本地生产板 ID", () => {
    const board = mapDlbBoardToUiBoard({ board_id: 88, sn: "PCB-88" }, 0, "CS-001")

    expect(board.boardId).toBe("88")
    expect(board.prodBoardId).toBe("")
  })

  it("保留产品和仪器型号 ID，且 sscp 按仪器名称映射", () => {
    const board = mapDlbBoardToUiBoard(
      {
        sn: "PCB-CATALOG-001",
        sscp: "SDS通用",
        instrumentModelId: 17,
        productModelId: 4
      },
      0,
      "CS-001"
    )

    expect(board.instrument).toBe("SDS通用")
    expect(board.product).toBe("")
    expect(board.instrumentModelId).toBe("17")
    expect(board.productModelId).toBe("4")
  })

  it("临时板只允许显式 tempBoardId 作为本地主键回退", () => {
    const rows = [{ id: 66, serialNumber: "LOCAL-TEMP" }]

    expect(findMatchingLocalBoardRow(rows, { boardId: 66, serial: "OTHER" }, "temporary")).toBeUndefined()
    expect(findMatchingLocalBoardRow(rows, { tempBoardId: 66, serial: "OTHER" }, "temporary")).toBeUndefined()
    expect(findMatchingLocalBoardRow(rows, { tempBoardId: 66 }, "temporary")).toEqual(rows[0])
  })

  it("生产板探测静默且匹配失败不再使用 SN 伪造 board_id", () => {
    expect(componentContent).toContain("getProdBoardDataBySn(serial, { silentError: true })")
    expect(componentContent).toContain("throw createMissingBoardsError([board]")
    expect(componentContent).not.toContain("buildFallbackProductionBoardRow")
    expect(componentContent).not.toContain("fallbackBoardId")
    expect(componentContent).toContain("getAssistantSchedulePushFeedback")
    expect(componentContent).toContain("response?.data?.autoScheduled")
    expect(componentContent).toContain('return assistantPushFeedback.state === "failed" ? "push_failed" : "success"')
  })

  it("新生产板未配置检测工艺时仍允许生成待执行工单", () => {
    expect(componentContent).not.toContain("生产电路板未绑定可用检测工艺")
    expect(componentContent).toContain("[buildGeneratedTestOption(testType, application.craft)]")
  })

  it("生产工单生成前按本次 SN 自动补入生产板，失败时保持待发布", () => {
    expect(apiContent).toContain('url: "data/assistant/circuit-board-module-order/ensure-production-boards"')
    expect(apiContent).toContain("boardSns: string[]")
    expect(componentContent).toContain("ensureCircuitModuleProductionBoards({ orderNo, boardSns })")
    expect(componentContent).toContain("生产电路板自动补入失败")
    expect(componentContent).toContain("工单保持待发布")

    const productionBranch = componentContent.match(
      /if \(application\.generatedOrderType === "production"\) \{([\s\S]*?)\n\s*return\n\s*\}/
    )?.[1]
    expect(productionBranch).toBeTruthy()
    expect(
      productionBranch?.indexOf("await ensureProductionBoardsBeforeGenerate(application, boardsForOrder)")
    ).toBeGreaterThanOrEqual(0)
    expect(
      productionBranch?.indexOf("await ensureProductionBoardsBeforeGenerate(application, boardsForOrder)")
    ).toBeLessThan(productionBranch?.indexOf("await buildGeneratedOrderBoardList") ?? -1)
  })
})
