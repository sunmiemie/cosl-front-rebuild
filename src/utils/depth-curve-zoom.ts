export const MIN_DEPTH_CURVE_SPAN_MS = 5 * 60 * 1000

export interface DepthCurveTimeRange {
  start: number
  end: number
}

export const getDepthCurveTimeRange = (timestamps: Iterable<unknown>): DepthCurveTimeRange | null => {
  let start = Number.POSITIVE_INFINITY
  let end = Number.NEGATIVE_INFINITY

  for (const timestamp of timestamps) {
    // 空值、布尔值和对象不能作为时间点，避免 Number 转换产生伪造的零时间戳。
    if (typeof timestamp !== "number" && typeof timestamp !== "string") continue
    if (typeof timestamp === "string" && timestamp.trim() === "") continue
    const value = Number(timestamp)
    if (!Number.isFinite(value)) continue
    start = Math.min(start, value)
    end = Math.max(end, value)
  }

  return Number.isFinite(start) && Number.isFinite(end) ? { start, end } : null
}

export const getDepthCurveRangeFromPercent = (
  fullRange: DepthCurveTimeRange,
  startPercent: number,
  endPercent: number
): DepthCurveTimeRange => {
  const fullSpan = Math.max(0, fullRange.end - fullRange.start)
  const start = fullRange.start + (fullSpan * Math.min(100, Math.max(0, startPercent))) / 100
  const end = fullRange.start + (fullSpan * Math.min(100, Math.max(0, endPercent))) / 100
  return start <= end ? { start, end } : { start: end, end: start }
}

export const resizeDepthCurveTimeRange = (
  fullRange: DepthCurveTimeRange,
  currentRange: DepthCurveTimeRange,
  scale: number,
  minSpan = MIN_DEPTH_CURVE_SPAN_MS
): DepthCurveTimeRange => {
  const fullSpan = Math.max(0, fullRange.end - fullRange.start)
  if (fullSpan <= minSpan || !Number.isFinite(scale) || scale <= 0) return { ...fullRange }

  const currentStart = Math.min(fullRange.end, Math.max(fullRange.start, currentRange.start))
  const currentEnd = Math.min(fullRange.end, Math.max(currentStart, currentRange.end))
  const currentSpan = Math.max(minSpan, currentEnd - currentStart)
  const targetSpan = Math.min(fullSpan, Math.max(minSpan, currentSpan * scale))
  const center = (currentStart + currentEnd) / 2
  let start = center - targetSpan / 2
  let end = center + targetSpan / 2

  if (start < fullRange.start) {
    end += fullRange.start - start
    start = fullRange.start
  }
  if (end > fullRange.end) {
    start -= end - fullRange.end
    end = fullRange.end
  }

  return {
    start: Math.max(fullRange.start, start),
    end: Math.min(fullRange.end, end)
  }
}
