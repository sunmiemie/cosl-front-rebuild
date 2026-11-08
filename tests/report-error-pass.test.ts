import { describe, expect, it } from "vitest"
import { ReportCheck } from "@/utils/report"

const selection = { type: "xray", position: "area", areaPosition: "detail", areaId: 1, detailId: 1, id: 1 }

const createReport = (pass: number) => {
  const error = { desc: "合成缺陷", url: ["defect-image"] }
  const detail = {
    id: 1,
    name: "焊点检查",
    picList: ["detail-image"],
    stepList: [
      { id: 1, pass },
      { id: 2, pass: 1 }
    ],
    errorList: [{ id: 1, error }],
    warnList: [{ id: 1, error, warn: { desc: "保留制程警示", url: ["warning-image"] } }],
    questionList: pass === 4 ? [{ id: 1, error, question: { desc: "保留疑问", url: ["question-image"] } }] : undefined
  }
  const neighbor = { id: 2, name: "相邻检查", stepList: [{ id: 1, pass: 1 }], picList: ["neighbor-image"] }
  const report = { json: { xray: { area: [{ detail: [detail, neighbor] }] } } }
  return { report, detail, neighbor }
}

describe("X-ray 区域明细缺陷通过", () => {
  it.each([
    [2, 1],
    [4, 3]
  ])("最后一个缺陷通过时将状态 %i 改为 %i 并保留明细", (before, after) => {
    const { report, detail, neighbor } = createReport(before)
    const steps = detail.stepList
    const neighborSnapshot = JSON.parse(JSON.stringify(neighbor))

    expect(ReportCheck.reportErrorPass(report, selection)).toBe(report)

    expect(report.json.xray.area[0].detail).toHaveLength(2)
    expect(report.json.xray.area[0].detail[0]).toBe(detail)
    expect(detail.stepList).toBe(steps)
    expect(detail.stepList).toEqual([
      { id: 1, pass: after },
      { id: 2, pass: 1 }
    ])
    expect(detail.name).toBe("焊点检查")
    expect(detail.picList).toEqual(["detail-image"])
    expect(detail).not.toHaveProperty("errorList")
    expect(detail.warnList).toEqual([{ id: 1, warn: { desc: "保留制程警示", url: ["warning-image"] } }])
    expect(detail.questionList).toEqual(
      before === 4 ? [{ id: 1, question: { desc: "保留疑问", url: ["question-image"] } }] : undefined
    )
    expect(report.json.xray.area[0].detail[1]).toBe(neighbor)
    expect(neighbor).toEqual(neighborSnapshot)
  })

  it("仍有其他缺陷时仅移除目标缺陷，保留剩余缺陷和相邻明细", () => {
    const { report, detail, neighbor } = createReport(2)
    const otherError = { id: 2, error: { desc: "尚未处理的缺陷", url: ["other-image"] } }
    detail.errorList.push(otherError)
    detail.stepList[1].pass = 2
    const errors = detail.errorList
    const neighborSnapshot = JSON.parse(JSON.stringify(neighbor))

    ReportCheck.reportErrorPass(report, selection)

    expect(report.json.xray.area[0].detail[0]).toBe(detail)
    expect(detail.errorList).toBe(errors)
    expect(detail.errorList).toEqual([otherError])
    expect(detail.errorList[0]).toBe(otherError)
    expect(detail.stepList).toEqual([
      { id: 1, pass: 1 },
      { id: 2, pass: 2 }
    ])
    expect(report.json.xray.area[0].detail[1]).toBe(neighbor)
    expect(neighbor).toEqual(neighborSnapshot)
  })
})
