import { describe, expect, it } from "vitest"
import {
  getWorkOrderScheduleStatusText,
  getWorkOrderScheduleTagType,
  hasRunningScheduleInstrument,
  isWorkOrderScheduled
} from "../src/views/dashboard/work-order-schedule/schedule-status"
import {
  filteredOrdersByScheduleState,
  normalizeScheduleListState
} from "../src/views/dashboard/work-order-schedule/schedule-helpers"

describe("work order schedule status", () => {
  it("shows running lifecycle status before scheduled status", () => {
    const order = {
      statusText: "测试中",
      scheduledStartAt: "2026-06-13 09:00:00",
      scheduledEndAt: "2026-06-13 11:00:00",
      scheduleSegments: []
    }

    expect(isWorkOrderScheduled(order)).toBe(true)
    expect(getWorkOrderScheduleStatusText(order)).toBe("测试中")
    expect(getWorkOrderScheduleTagType(order)).toBe("success")
  })

  it("shows scheduled only when the lifecycle is still pending", () => {
    const order = {
      statusText: "待测试",
      scheduledStartAt: "2026-06-13 09:00:00",
      scheduledEndAt: "2026-06-13 11:00:00",
      scheduleSegments: []
    }

    expect(getWorkOrderScheduleStatusText(order)).toBe("已排程")
    expect(getWorkOrderScheduleTagType(order)).toBe("primary")
  })

  it("keeps review status out of pending schedule list before scheduling", () => {
    const order = {
      statusText: "待审核",
      scheduledStartAt: null,
      scheduledEndAt: null,
      scheduleSegments: []
    }

    expect(normalizeScheduleListState(order)).toBe("other")
    expect(filteredOrdersByScheduleState([order], "pending")).toEqual([])
    expect(getWorkOrderScheduleStatusText(order)).toBe("待审核")
    expect(getWorkOrderScheduleTagType(order)).toBe("warning")
  })

  it("does not treat a numeric status alone as running", () => {
    const order = {
      status: 1,
      scheduledStartAt: "2026-06-13 09:00:00",
      scheduledEndAt: "2026-06-13 11:00:00",
      scheduleSegments: []
    }

    expect(getWorkOrderScheduleStatusText(order)).toBe("已排程")
    expect(getWorkOrderScheduleTagType(order)).toBe("primary")
  })

  it("shows running target status before scheduled status", () => {
    const order = {
      isRunningTarget: true,
      statusText: "待领取",
      scheduledStartAt: "2026-06-13 09:00:00",
      scheduledEndAt: "2026-06-13 11:00:00",
      scheduleSegments: []
    }

    expect(getWorkOrderScheduleStatusText(order)).toBe("测试中")
    expect(getWorkOrderScheduleTagType(order)).toBe("success")
  })

  it("detects running instruments from mapped and backend payloads", () => {
    expect(hasRunningScheduleInstrument([{ instrumentStatus: 1 }])).toBe(true)
    expect(hasRunningScheduleInstrument([{ instrument_status: 1 }])).toBe(true)
    expect(hasRunningScheduleInstrument([{ status: "1" }])).toBe(true)
    expect(hasRunningScheduleInstrument([{ instrumentStatus: 1, isCompleted: true }])).toBe(false)
    expect(hasRunningScheduleInstrument([{ instrument_status: 2 }])).toBe(false)
  })
})
