import type { DeviceInstanceStatus, DeviceOnlineStatus } from "@/api/device-instance/types"

export type SelectableDeviceOnlineStatus = Exclude<DeviceOnlineStatus, "unknown">

const allOnlineStatusOptions: SelectableDeviceOnlineStatus[] = [
  "standby",
  "testing",
  "offline",
  "abnormal",
  "paused",
  "finished"
]

const limitedOnlineStatusOptions: SelectableDeviceOnlineStatus[] = ["standby", "offline"]

export const getDeviceOnlineStatusOptions = (status: DeviceInstanceStatus): SelectableDeviceOnlineStatus[] => {
  return status === "normal" ? allOnlineStatusOptions : limitedOnlineStatusOptions
}

export const resolveDeviceOnlineStatus = (
  status: DeviceInstanceStatus,
  onlineStatus: DeviceOnlineStatus
): SelectableDeviceOnlineStatus => {
  const options = getDeviceOnlineStatusOptions(status)
  return options.includes(onlineStatus as SelectableDeviceOnlineStatus)
    ? (onlineStatus as SelectableDeviceOnlineStatus)
    : options[0]
}
