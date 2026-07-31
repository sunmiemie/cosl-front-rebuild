export const CONNECTION_MODE_OPTIONS = [
  { value: "RS-485", label: "RS-485" },
  { value: "USB-HID", label: "USB-HID" },
  { value: "USB-Serial", label: "USB-Serial" },
  { value: "Ethernet", label: "Ethernet" }
] as const

export const BAUD_RATE_OPTIONS = [
  { value: "9600", label: "9600" },
  { value: "19200", label: "19200" },
  { value: "38400", label: "38400" },
  { value: "57600", label: "57600" },
  { value: "115200", label: "115200" }
] as const

export const PORT_PRESETS = [
  { value: "COM1", label: "COM1" },
  { value: "COM2", label: "COM2" },
  { value: "COM3", label: "COM3" },
  { value: "COM4", label: "COM4" },
  { value: "COM5", label: "COM5" },
  { value: "自动识别", label: "自动识别" }
] as const
