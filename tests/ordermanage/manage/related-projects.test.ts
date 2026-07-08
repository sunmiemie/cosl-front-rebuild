import { describe, expect, it } from "vitest"
import { getRelatedProjectsByCommissionNo } from "@/views/ordermanage/manage/related-projects"

describe("getRelatedProjectsByCommissionNo", () => {
  it("keeps rows related by commission number or application number", () => {
    const rows = [
      { sn: "SN-001", name: "Sample A", commNo: "WTO-2026-0327" },
      { sn: "SN-002", name: "Sample B", commission_no: "WTO-2026-0328" },
      { sn: "SN-003", name: "Sample C", commissionNo: "WTO-2026-0327" },
      { sn: "SN-004", name: "Sample D", applicationNo: "WTO-2026-0327" }
    ]

    expect(getRelatedProjectsByCommissionNo(rows, "WTO-2026-0327").map((item) => item.sn)).toEqual([
      "SN-001",
      "SN-003",
      "SN-004"
    ])
  })

  it("normalizes relation rows from multiple backend field names", () => {
    const rows = [
      {
        sn_number: "SN-100",
        sample_name: "Connector",
        spec_model: "P2",
        quantity: "4",
        device_name: "Vibration station",
        work_hours: "2.5",
        tester: "Tester A",
        completed_at: "2026-06-01",
        commission_sample_name: "Commission sample",
        commission_sample_spec: "Model A",
        commission_no: "WTO-2026-0327"
      }
    ]

    expect(getRelatedProjectsByCommissionNo(rows, "WTO-2026-0327")[0]).toEqual({
      sn: "SN-100",
      name: "Connector",
      spec: "P2",
      qty: 4,
      device: "Vibration station",
      hours: 2.5,
      inspector: "Tester A",
      doneAt: "2026-06-01",
      commissionSampleName: "Commission sample",
      commissionSampleSpec: "Model A"
    })
  })
})
