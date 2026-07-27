import type { AssistantInspectionResult, InspectionBaseInfoListItem } from "@/api/inspection-base/types"
import { getAssistantResultPhotoCount, getParticipantText } from "./assistant-results"

export interface InspectionRecordExportRow {
  inspectionDate: string
  inspectionNo: string
  deviceName: string
  deviceSn: string
  inspector: string
  itemCount: number
  status: string
  photoCount: number | string
  source: string
  updatedAt: string
}

const EXPORT_COLUMNS: Array<{
  label: string
  value: (row: InspectionRecordExportRow) => string | number
}> = [
  { label: "巡检日期", value: (row) => row.inspectionDate },
  { label: "巡检编号", value: (row) => row.inspectionNo },
  { label: "巡检设备名称", value: (row) => row.deviceName },
  { label: "设备SN号", value: (row) => row.deviceSn },
  { label: "巡检人员", value: (row) => row.inspector },
  { label: "巡检内容数", value: (row) => row.itemCount },
  { label: "巡检状态", value: (row) => row.status },
  { label: "照片数", value: (row) => row.photoCount },
  { label: "数据来源", value: (row) => row.source },
  { label: "更新时间", value: (row) => row.updatedAt }
]

function localInspectionDate(record: InspectionBaseInfoListItem) {
  return record.inspection_date || record.created_at?.slice(0, 10) || record.updated_at?.slice(0, 10) || ""
}

export function buildInspectionRecordExportRows(
  localRecords: InspectionBaseInfoListItem[],
  assistantResults: AssistantInspectionResult[]
): InspectionRecordExportRow[] {
  const rows: InspectionRecordExportRow[] = [
    ...localRecords.map((record) => ({
      inspectionDate: localInspectionDate(record),
      inspectionNo: record.inspection_no,
      deviceName: record.device_name,
      deviceSn: record.device_sn,
      inspector: record.inspector,
      itemCount: record.item_count || 0,
      status: record.status || "",
      photoCount: "",
      source: "本地巡检",
      updatedAt: record.updated_at || record.created_at || ""
    })),
    ...assistantResults.map((record) => ({
      inspectionDate: (record.inspectionDate || "").slice(0, 10),
      inspectionNo: record.id,
      deviceName: record.equipmentTypeName || record.equipmentId || record.equipmentType,
      deviceSn: record.sn || "",
      inspector: getParticipantText(record),
      itemCount: (record.items || []).length,
      status: "已完成",
      photoCount: getAssistantResultPhotoCount(record),
      source: "小助手",
      updatedAt: record.inspectionDate || ""
    }))
  ]

  return rows.sort((left, right) => {
    const dateCompare = right.inspectionDate.localeCompare(left.inspectionDate)
    return dateCompare || left.inspectionNo.localeCompare(right.inspectionNo)
  })
}

function escapeExcelCell(value: string | number) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, "<br />")
}

export function buildInspectionRecordExcelHtml(rows: InspectionRecordExportRow[]) {
  const header = EXPORT_COLUMNS.map((column) => `<th>${column.label}</th>`).join("")
  const body = rows
    .map(
      (row) => `<tr>${EXPORT_COLUMNS.map((column) => `<td>${escapeExcelCell(column.value(row))}</td>`).join("")}</tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      table { border-collapse: collapse; }
      th, td {
        border: 1px solid #222;
        padding: 6px 10px;
        text-align: left;
        vertical-align: middle;
        white-space: nowrap;
        mso-number-format: "\\@";
      }
      th { background: #eef3f8; font-weight: 700; }
    </style>
  </head>
  <body>
    <table>
      <thead><tr>${header}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  </body>
</html>`
}

export function downloadInspectionRecordExcel(rows: InspectionRecordExportRow[], fileName: string) {
  const blob = new Blob(["\ufeff", buildInspectionRecordExcelHtml(rows)], {
    type: "application/vnd.ms-excel;charset=utf-8;"
  })
  const href = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = href
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(href)
}
