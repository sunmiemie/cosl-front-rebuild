import { describe, expect, it } from "vitest"
import { getRelatedProjectsByCommissionNo } from "@/views/ordermanage/manage/related-projects"

describe("getRelatedProjectsByCommissionNo", () => {
  it("keeps only rows related to the selected commission order", () => {
    const rows = [
      { sn: "SN-001", name: "样品A", commNo: "WTO-2026-0327" },
      { sn: "SN-002", name: "样品B", commission_no: "WTO-2026-0328" },
      { sn: "SN-003", name: "样品C", commissionNo: "WTO-2026-0327" }
    ]

    expect(getRelatedProjectsByCommissionNo(rows, "WTO-2026-0327").map((item) => item.sn)).toEqual([
      "SN-001",
      "SN-003"
    ])
  })

  it("normalizes relation rows from multiple backend field names", () => {
    const rows = [
      {
        sn_number: "SN-100",
        sample_name: "连接器",
        spec_model: "P2",
        quantity: "4",
        device_name: "振动台",
        work_hours: "2.5",
        tester: "张三",
        completed_at: "2026-06-01",
        commission_sample_name: "委托样品",
        commission_sample_spec: "A型",
        commission_no: "WTO-2026-0327"
      }
    ]

    expect(getRelatedProjectsByCommissionNo(rows, "WTO-2026-0327")[0]).toEqual({
      sn: "SN-100",
      name: "连接器",
      spec: "P2",
      qty: 4,
      device: "振动台",
      hours: 2.5,
      inspector: "张三",
      doneAt: "2026-06-01",
      commissionSampleName: "委托样品",
      commissionSampleSpec: "A型"
    })
  })
})
