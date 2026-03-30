import { describe, expect, it } from "vitest"
import {
  MIN_DEPTH_CURVE_SPAN_MS,
  getDepthCurveRangeFromPercent,
  getDepthCurveTimeRange,
  resizeDepthCurveTimeRange
} from "@/utils/depth-curve-zoom"

describe("depth curve time zoom", () => {
  it("finds the complete range and ignores invalid timestamps", () => {
    expect(getDepthCurveTimeRange([Number.NaN, 600_000, "0", undefined, 300_000])).toEqual({
      start: 0,
      end: 600_000
    })
    expect(getDepthCurveTimeRange([undefined, Number.NaN])).toBeNull()
  })

  it("ignores missing and non-numeric timestamp values instead of inventing epoch points", () => {
    expect(getDepthCurveTimeRange([null, "", "  ", false, true, [], 600_000, "900000"])).toEqual({
      start: 600_000,
      end: 900_000
    })
    expect(getDepthCurveTimeRange([null, "", false, {}])).toBeNull()
  })

  it("zooms by twenty percent around the current center", () => {
    expect(resizeDepthCurveTimeRange({ start: 0, end: 1_000_000 }, { start: 0, end: 1_000_000 }, 0.8)).toEqual({
      start: 100_000,
      end: 900_000
    })
  })

  it("never zooms in below five minutes", () => {
    expect(resizeDepthCurveTimeRange({ start: 0, end: 1_000_000 }, { start: 320_000, end: 680_000 }, 0.8)).toEqual({
      start: 350_000,
      end: 650_000
    })
    expect(MIN_DEPTH_CURVE_SPAN_MS).toBe(300_000)
  })

  it("keeps zoomed ranges inside the complete data range", () => {
    expect(resizeDepthCurveTimeRange({ start: 0, end: 1_000_000 }, { start: 0, end: 400_000 }, 1.2)).toEqual({
      start: 0,
      end: 480_000
    })
    expect(resizeDepthCurveTimeRange({ start: 0, end: 1_000_000 }, { start: 700_000, end: 1_000_000 }, 1.2)).toEqual({
      start: 640_000,
      end: 1_000_000
    })
  })

  it("returns the complete range when it is not longer than five minutes", () => {
    const fullRange = { start: 100, end: 100 + MIN_DEPTH_CURVE_SPAN_MS }
    expect(resizeDepthCurveTimeRange(fullRange, { start: 10_000, end: 20_000 }, 0.8)).toEqual(fullRange)
  })

  it("converts dragged percentage windows back to timestamps", () => {
    expect(getDepthCurveRangeFromPercent({ start: 100_000, end: 1_100_000 }, 20, 70)).toEqual({
      start: 300_000,
      end: 800_000
    })
  })
})
