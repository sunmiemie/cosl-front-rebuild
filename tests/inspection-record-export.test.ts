import { describe, expect, it } from "vitest"
import type { AssistantInspectionResult, InspectionBaseInfoListItem } from "@/api/inspection-base/types"
import {
  buildInspectionRecordExcelHtml,
  buildInspectionRecordExportRows
} from "@/views/inspectionmanage/info-view/inspection-record-export"
import { getAssistantPhotoUrl } from "@/views/inspectionmanage/info-view/assistant-results"

const localRecord: InspectionBaseInfoListItem = {
  id: 1,
  inspection_no: "IP-001",
  device_name: "高温高压井-1",
  device_sn: "SN-GWY-001",
  inspector: "张三",
  status: "正常",
  item_count: 2,
  inspection_date: "2026-07-03",
  updated_at: "2026-07-03 10:00:00"
}

const assistantRecord: AssistantInspectionResult = {
  id: "A-002",
  equipmentType: "3",
  equipmentTypeName: "高温高压井",
  equipmentId: "GWY-2",
  inspectionDate: "2026-07-04 11:00:00",
  sn: "SN-GWY-002",
  participants: [
    {
      inspectionPersonId: "10",
      inspectionPersonName: "李四",
      inspectionPersonDept: "测试中心"
    }
  ],
  items: [
    {
      itemId: "101",
      photos: [
        {
          itemPhotoName: "result.jpg",
          itemPhotoBase64: "ZmFrZQ=="
        }
      ]
    }
  ]
}

describe("巡检记录表格导出", () => {
  it("按 GIF 文件名生成正确的图片 Data URL", () => {
    expect(
      getAssistantPhotoUrl({
        itemPhotoName: "inspection.gif",
        itemPhotoBase64: "R0lGODlh"
      })
    ).toBe("data:image/gif;base64,R0lGODlh")
    expect(
      getAssistantPhotoUrl({
        itemPhotoName: "empty.gif",
        itemPhotoBase64: ""
      })
    ).toBe("")
  })

  it("合并本地巡检和小助手结果并按日期倒序导出", () => {
    const rows = buildInspectionRecordExportRows([localRecord], [assistantRecord])

    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
      inspectionDate: "2026-07-04",
      inspectionNo: "A-002",
      source: "小助手",
      photoCount: 1
    })
    expect(rows[1]).toMatchObject({
      inspectionNo: "IP-001",
      source: "本地巡检",
      status: "正常"
    })
  })

  it("生成 Excel 表格所需字段并转义单元格内容", () => {
    const rows = buildInspectionRecordExportRows([{ ...localRecord, device_name: "高温箱<测试>" }], [])
    const html = buildInspectionRecordExcelHtml(rows)

    expect(html).toContain("<th>巡检日期</th>")
    expect(html).toContain("<th>巡检设备名称</th>")
    expect(html).toContain("<th>数据来源</th>")
    expect(html).toContain("高温箱&lt;测试&gt;")
    expect(html).not.toContain("高温箱<测试>")
  })
})
