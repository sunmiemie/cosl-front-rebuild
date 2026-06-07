import { describe, expect, it } from "vitest"
import {
  getDeviceOnlineStatusOptions,
  resolveDeviceOnlineStatus
} from "@/views/devicemanage/device/psi/status-options"

describe("getDeviceOnlineStatusOptions", () => {
  it("returns all selectable online statuses when device status is normal", () => {
    expect(getDeviceOnlineStatusOptions("normal")).toEqual([
      "standby",
      "testing",
      "offline",
      "abnormal",
      "paused",
      "finished"
    ])
  })

  it.each(["fault", "maintenance", "repair"] as const)(
    "returns only standby and offline when device status is %s",
    (status) => {
      expect(getDeviceOnlineStatusOptions(status)).toEqual(["standby", "offline"])
    }
  )

  it("keeps an allowed online status for non-normal device status", () => {
    expect(resolveDeviceOnlineStatus("fault", "offline")).toBe("offline")
  })

  it("falls back to standby when online status is not allowed by device status", () => {
    expect(resolveDeviceOnlineStatus("maintenance", "testing")).toBe("standby")
    expect(resolveDeviceOnlineStatus("repair", "unknown")).toBe("standby")
  })
})
