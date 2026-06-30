import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { mapDlbBoardToUiBoard } from "../src/views/testmanage/circuit-module-inspection/components/circuit-application-helpers"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")
const componentPath = "src/views/testmanage/circuit-module-inspection/components/CircuitBoardModule.vue"

describe("电路板申请单单板详情", () => {
  it("小助手电路板字段会映射到单板详情数据且物料号不使用 SN 兜底", () => {
    const board = mapDlbBoardToUiBoard(
      {
        id: 11,
        sscp: "SDS通用",
        ypmc: "150霍尔驱动电路",
        ggxh: "MD150-202505-HALL",
        gysmc: "北京万龙精益科技有限公司",
        pch: "25081502",
        sl: 1,
        sn: "MD150-013",
        cslb: "连接器及线缆线束组件",
        csnr: "焊接质量",
        cjfj: "初检",
        hth: "YF90834",
        dhrq: "2026-06-25",
        ray: "是",
        gqd: "否",
        towtest: "否",
        threetest: "否"
      },
      0,
      "CS20260630002"
    )

    expect(board.materialNo).toBe("")
    expect(board.product).toBe("SDS通用")
    expect(board.testCategory).toBe("连接器及线缆线束组件")
    expect(board.testContent).toBe("焊接质量")
    expect(board.initialInspection).toBe("初检")
    expect(board.contractNo).toBe("YF90834")
    expect(board.arrivalDate).toBe("2026-06-25")
    expect(board.xray).toBe("是")
    expect(board.bow).toBe("否")
    expect(board.twoD).toBe("否")
    expect(board.threeD).toBe("否")
  })

  it("电路板列表提供单板详情弹窗展示测试类别和测试内容等字段", () => {
    const content = read(componentPath)

    expect(content).toContain("boardDetailVisible")
    expect(content).toContain("openBoardDetail")
    expect(content).toContain("电路板详情")
    expect(content).toContain("测试类别")
    expect(content).toContain("测试内容")
    expect(content).toContain("所属产品")
    expect(content).toContain("初检/复检")
    expect(content).toContain("合同号")
    expect(content).toContain("到货日期")
    expect(content).toContain("X-Ray检测")
    expect(content).toContain("弓曲度检测")
    expect(content).toContain("2D留存检测")
    expect(content).toContain("3D检测")
  })
})
