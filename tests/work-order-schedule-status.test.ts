import { describe, expect, it } from "vitest"
import {
  getCompletedScheduleInstrumentGroupStatusText,
  getCompletedScheduleInstrumentStatusText,
  getWorkOrderScheduleStatusText,
  getWorkOrderScheduleTagType,
  hasRunningScheduleInstrument,
  isWorkOrderScheduled
} from "../src/views/dashboard/work-order-schedule/schedule-status"
import {
  applySchedulePayloadToTargetOrder,
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

  it("keeps completed instrument rows out of the pending schedule list even when the parent order is pending", () => {
    const order = {
      status: 1,
      statusText: "已完成",
      scheduledStartAt: null,
      scheduledEndAt: null,
      scheduleSegments: []
    }

    expect(normalizeScheduleListState(order)).toBe("other")
    expect(filteredOrdersByScheduleState([order], "pending")).toEqual([])
    expect(getWorkOrderScheduleStatusText(order)).toBe("已完成")
    expect(getWorkOrderScheduleTagType(order)).toBe("success")
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

  it("detects completed status from one instrument row", () => {
    expect(getCompletedScheduleInstrumentStatusText({ is_completed: true })).toBe("已完成")
    expect(getCompletedScheduleInstrumentStatusText({ isCompleted: true })).toBe("已完成")
    expect(getCompletedScheduleInstrumentStatusText({ instrument_status: 2 })).toBe("已完成")
    expect(getCompletedScheduleInstrumentStatusText({ instrumentStatus: 2 })).toBe("已完成")
    expect(getCompletedScheduleInstrumentStatusText({ instrument_status: 1 })).toBe("")
  })

  it("marks an order-level card completed only when all instrument rows are completed", () => {
    expect(
      getCompletedScheduleInstrumentGroupStatusText([
        { is_completed: true },
        { instrument_status: 2 }
      ])
    ).toBe("已完成")
    expect(
      getCompletedScheduleInstrumentGroupStatusText([
        { is_completed: true },
        { instrument_status: 0 }
      ])
    ).toBe("")
    expect(getCompletedScheduleInstrumentGroupStatusText([])).toBe("")
  })

  it("keeps per-segment schedule device when applying saved schedule payload", () => {
    const order: {
      scheduleSegments: Array<{ scheduledStartAt?: string; scheduledEndAt?: string; useDevice?: string }>
    } = {
      scheduleSegments: []
    }

    applySchedulePayloadToTargetOrder(order, {
      scheduled_start_at: "2026-07-07 08:00:00",
      scheduled_end_at: "2026-07-08 13:00:00",
      schedule_segments: [
        {
          scheduled_start_at: "2026-07-07 08:00:00",
          scheduled_end_at: "2026-07-07 10:00:00",
          use_device: "高温高压井-2"
        },
        {
          scheduled_start_at: "2026-07-08 10:00:00",
          scheduled_end_at: "2026-07-08 13:00:00",
          useDevice: "高温高压井-1"
        }
      ]
    })

    expect(order.scheduleSegments.map((segment) => segment.useDevice)).toEqual(["高温高压井-2", "高温高压井-1"])
  })
})
