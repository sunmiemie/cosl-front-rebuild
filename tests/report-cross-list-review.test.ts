import { describe, expect, it } from "vitest"
import { ReportCheck } from "@/utils/report"

type Finding = { desc: string; url: string[] }
type ReviewItem = { id: number; error?: Finding; question?: Finding; warn?: Finding }
type FindingKind = "error" | "question"
type Section = {
  stepList: Array<{ id: number; pass: number }>
  errorList?: ReviewItem[]
  questionList?: ReviewItem[]
  warnList?: ReviewItem[]
}

const actions = [
  { label: "缺陷通过", method: "reportErrorPass", source: "error", destination: undefined, before: 2, after: 1 },
  { label: "疑问通过", method: "reportQuestionPass", source: "question", destination: undefined, before: 3, after: 1 },
  { label: "缺陷转疑问", method: "reportErrorQuestion", source: "error", destination: "question", before: 2, after: 3 },
  { label: "疑问转缺陷", method: "reportQuestionError", source: "question", destination: "error", before: 3, after: 2 }
] as const

const locations = ["eyes", "eyesBak", "xray"].flatMap((type) =>
  ["total", "general", "detail"].map((level) => ({ type, level, label: `${type}/${level}` }))
)

const fixture = (type: string, level: string, section: Section) => {
  const neighbor = { stepList: [{ id: 1, pass: 1 }], name: "保留相邻检查" }
  const branch =
    level === "total"
      ? { total: section, area: [neighbor] }
      : { total: neighbor, area: [level === "general" ? { general: section } : { detail: [section, neighbor] }] }
  const report = { json: type === "xray" ? { xray: branch } : { threeD: { [type]: branch } } }
  const selection = {
    type,
    position: level === "total" ? "total" : "area",
    areaPosition: level,
    areaId: 1,
    detailId: 1,
    id: 1
  }
  return { report, selection, neighbor }
}

const finding = (desc: string): Finding => ({ desc, url: [`synthetic:${desc}`] })
const listKey = (kind: FindingKind) => `${kind}List` as const

describe.each(locations)("报告审核分类独立：$label", ({ type, level }) => {
  it.each(actions)("$label 不依赖其他步骤的分类记录", (action) => {
    // 先覆盖只有其他分类记录，再覆盖同时存在其他步骤警示的常见报告。
    for (const withWarning of [false, true]) {
      const sourceKey = listKey(action.source)
      const otherKind = action.source === "error" ? "question" : "error"
      const otherKey = listKey(otherKind)
      const original = finding("当前检查发现")
      const other = { id: 3, [otherKind]: finding("其他检查发现") }
      const warning = { id: 2, warn: finding("其他检查制程警示") }
      const section: Section = {
        stepList: [
          { id: 1, pass: action.before },
          { id: 2, pass: 1 },
          { id: 3, pass: otherKind === "error" ? 2 : 3 }
        ],
        [sourceKey]: [{ id: 1, [action.source]: original }],
        [otherKey]: [other],
        ...(withWarning ? { warnList: [warning] } : {})
      }
      const otherSnapshot = structuredClone(other)
      const warningSnapshot = structuredClone(warning)
      const { report, selection, neighbor } = fixture(type, level, section)
      const neighborSnapshot = structuredClone(neighbor)

      expect(ReportCheck[action.method](report, selection)).toBe(report)

      expect(section.stepList[0].pass).toBe(action.after)
      expect(section.stepList.slice(1)).toEqual([
        { id: 2, pass: 1 },
        { id: 3, pass: otherKind === "error" ? 2 : 3 }
      ])
      expect(section).not.toHaveProperty(sourceKey)
      expect(section[otherKey]?.[0]).toBe(other)
      expect(other).toEqual(otherSnapshot)
      expect(section[otherKey]).toHaveLength(action.destination ? 2 : 1)
      if (action.destination) {
        expect(section[otherKey]?.[1]).toEqual({ id: 1, [action.destination]: original })
      }
      expect(section.warnList).toEqual(withWarning ? [warningSnapshot] : undefined)
      if (withWarning) expect(section.warnList?.[0]).toBe(warning)
      expect(neighbor).toEqual(neighborSnapshot)
    }
  })

  it.each(actions)("$label 仍同步同一步骤的关联记录并保留其他步骤", (action) => {
    const sourceKey = listKey(action.source)
    const otherKind = action.source === "error" ? "question" : "error"
    const otherKey = listKey(otherKind)
    const sourceFinding = finding("原发现")
    const oppositeFinding = finding("关联发现")
    const warningFinding = finding("保留制程警示")
    const target: ReviewItem = {
      id: 1,
      [action.source]: sourceFinding,
      [otherKind]: oppositeFinding,
      warn: warningFinding
    }
    const opposite = { ...target }
    const warning = { ...target }
    const neighborItem = { id: 2, [action.source]: finding("其他步骤发现") }
    const neighborSnapshot = structuredClone(neighborItem)
    const section: Section = {
      stepList: [
        { id: 1, pass: 4 },
        { id: 2, pass: action.before }
      ],
      [sourceKey]: [target, neighborItem],
      [otherKey]: [opposite],
      warnList: [warning]
    }
    const { report, selection } = fixture(type, level, section)

    expect(ReportCheck[action.method](report, selection)).toBe(report)

    expect(section.stepList).toEqual([
      { id: 1, pass: action.source === "error" ? 3 : 2 },
      { id: 2, pass: action.before }
    ])
    expect(section[sourceKey]).toEqual([neighborSnapshot])
    expect(section[sourceKey]?.[0]).toBe(neighborItem)
    expect(section[otherKey]).toEqual([opposite])
    expect(opposite).not.toHaveProperty(action.source)
    expect(warning).not.toHaveProperty(action.source)
    expect(warning.warn).toBe(warningFinding)
    const remaining = opposite[otherKind]
    expect(remaining?.desc).toBe(action.destination ? "关联发现\n原发现" : "关联发现")
    expect(remaining?.url).toEqual(
      action.destination ? ["synthetic:关联发现", "synthetic:原发现"] : ["synthetic:关联发现"]
    )
    expect(warning[otherKind]).toBe(remaining)
  })
})
