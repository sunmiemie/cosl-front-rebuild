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

const writePrintImages = async (printWindow: Window, imageData: Record<string, string>) => {
  const doc = printWindow.document
  doc.write("<html><head><title>Print QR Codes</title></head><body></body></html>")
  doc.close()
  // 图片实际加载完成后再打印，避免文档 onload 早于异步图片。
  await Promise.all(
    Object.values(imageData).map(
      (src) =>
        new Promise<void>((resolve, reject) => {
          const img = doc.createElement("img")
          img.alt = "QR Code"
          img.onload = () => resolve()
          img.onerror = () => reject(new Error("二维码图片加载失败"))
          doc.body.appendChild(img)
          doc.body.appendChild(doc.createElement("br"))
          img.src = src
          if (img.complete && img.naturalWidth > 0) resolve()
        })
    )
  )
}

export const printBoardQrcodes = async (rows: QrcodeBoardRow[], options: QrcodePrintOptions = {}) => {
  const normalizedRows = rows
    .map((row) => normalizeBoardForQrcode(row, options.sourceType))
    .filter((row) => Boolean(row.seria))

  if (normalizedRows.length === 0) {
    ElMessage.warning(options.emptyMessage || "没有可打印的电路板二维码")
    return false
  }

  // 在用户点击的同步阶段打开窗口，避免请求完成后被浏览器拦截。
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    ElMessage.error("无法打开打印窗口")
    return false
  }
  try {
    const res = await getQRcodeImgApi({
      data: normalizedRows,
      headerKey: "name",
      seriaKey: "seria",
      startTimeKey: "startTime"
    })
    if (printWindow.closed) return false
    if (res.code !== 0) {
      ElMessage.error(res.message || "获取二维码失败")
      return false
    }
    const imageData = res.data || {}
    if (Object.keys(imageData).length === 0) {
      ElMessage.warning("未获取到二维码图片")
      return false
    }
    await writePrintImages(printWindow, imageData)
    if (printWindow.closed) return false
    printWindow.print()
    return true
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "二维码打印失败")
    return false
  } finally {
    printWindow.close()
  }
}
