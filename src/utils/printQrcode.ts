import { ElMessage } from "element-plus"
import { getQRcodeImgApi } from "@/api/qrcode"

export type QrcodeBoardSource = "production" | "temporary"

export interface QrcodeBoardRow {
  id?: string | number
  name?: string
  model?: string | { name?: string }
  boardmodel?: string
  board_model_name?: string
  boardName?: string
  seria?: string
  serialNumber?: string
  serial_num?: string
  sn?: string
  startTime?: string
  start_time?: string
  dateTime?: string
}

export interface QrcodePrintOptions {
  sourceType?: QrcodeBoardSource
  emptyMessage?: string
}

export interface NormalizedQrcodeBoard {
  id?: string | number
  name: string
  seria: string
  startTime: string
}

const getModelName = (row: QrcodeBoardRow) => {
  if (typeof row.model === "object" && row.model?.name) return row.model.name
  if (typeof row.model === "string") return row.model
  return row.name || row.boardName || row.boardmodel || row.board_model_name || ""
}

export const normalizeBoardForQrcode = (
  row: QrcodeBoardRow,
  sourceType: QrcodeBoardSource = "production"
): NormalizedQrcodeBoard => {
  const serial = row.seria || row.serialNumber || row.serial_num || row.sn || ""
  const name = getModelName(row) || (sourceType === "temporary" ? "临时电路板" : "生产电路板")
  const startTime = row.startTime || row.start_time || row.dateTime || ""

  return {
    id: row.id,
    name,
    seria: serial,
    startTime
  }
}

const writePrintImages = (printWindow: Window, imageData: Record<string, string>) => {
  printWindow.document.write("<html><head><title>Print QR Codes</title></head><body>")

  Object.values(imageData).forEach((src) => {
    const img = new Image()
    img.src = src
    img.alt = "QR Code"
    printWindow.document.body.appendChild(img)
    printWindow.document.body.appendChild(document.createElement("br"))
  })

  printWindow.document.write("</body></html>")
  printWindow.document.close()
}

export const printBoardQrcodes = async (rows: QrcodeBoardRow[], options: QrcodePrintOptions = {}) => {
  const normalizedRows = rows
    .map((row) => normalizeBoardForQrcode(row, options.sourceType))
    .filter((row) => Boolean(row.seria))

  if (normalizedRows.length === 0) {
    ElMessage.warning(options.emptyMessage || "没有可打印的电路板二维码")
    return false
  }

  const res = await getQRcodeImgApi({
    data: normalizedRows,
    headerKey: "name",
    seriaKey: "seria",
    startTimeKey: "startTime"
  })

  if (res.code !== 0) {
    ElMessage.error(res.message || "获取二维码失败")
    return false
  }

  const imageData = res.data || {}
  if (Object.keys(imageData).length === 0) {
    ElMessage.warning("未获取到二维码图片")
    return false
  }

  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    ElMessage.error("无法打开打印窗口")
    return false
  }

  writePrintImages(printWindow, imageData)
  printWindow.onload = function () {
    printWindow.print()
    printWindow.close()
  }

  return true
}
