import type { ApiCalibrationWell, ApiWellCommConfig } from "@/api/calibration-well/types"

export type DeviceRole = "instrument" | "instrument_b" | "data_stick" | "power_supply"

export interface WellCommConfig {
  deviceRole: DeviceRole
  vid?: string
  pid?: string
  adapterSerial?: string
  baudRate?: number
  transport?: "lan" | "serial"
  host?: string
  port?: number
}

export interface CalibrationWell {
  id: number
  wellNo: string
  wellName: string
  wellType: "hi" | "lo"
  wellTypeText?: string
  apiValue: number | null
  dualSensor: boolean
  holeDiameter: number | null
  commConfigs: WellCommConfig[]
  dataSource: "mock" | "live"
  refMin: number
  refMax: number
  kaMin: number
  kaMax: number
  baLimit: number
  kbMin: number
  kbMax: number
  bbLimit: number
  status: number
  remark: string
}

export interface WellFilter {
  keyword: string
  wellType: string
  status: string
  page: number
  pageSize: number
}

export interface WellFormModel {
  wellNo: string
  wellName: string
  wellType: "hi" | "lo"
  apiValue: number | null
  dualSensor: boolean
  holeDiameter: number | null
  commConfigs: WellCommConfig[]
  refMin: number
  refMax: number
  kaMin: number
  kaMax: number
  baLimit: number
  kbMin: number
  kbMax: number
  bbLimit: number
  status: number
  remark: string
}

export function defaultCoeffRanges(wellType: "hi" | "lo", dualSensor = false) {
  const isHi = wellType === "hi"
  const kMin = 3.5
  const kMax = 5.5
  const bLimit = 4
  return {
    refMin: isHi ? 20 : 1,
    refMax: isHi ? 60 : 3,
    kaMin: kMin,
    kaMax: kMax,
    baLimit: bLimit,
    kbMin: kMin,
    kbMax: kMax,
    bbLimit: bLimit
  }
}

function readNumber(raw: string | number | null | undefined, fallback: number) {
  if (raw == null || raw === "") return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

export function createUsbCommConfig(role: DeviceRole = "instrument"): WellCommConfig {
  return {
    deviceRole: role,
    vid: "0403",
    pid: "6001",
    adapterSerial: "",
    baudRate: role === "data_stick" ? 9600 : 115200
  }
}

export function createPowerCommConfig(): WellCommConfig {
  return {
    deviceRole: "power_supply",
    transport: "lan",
    host: "192.168.0.201",
    port: 30000
  }
}

export function createDefaultCommConfigs(dualSensor = false): WellCommConfig[] {
  return normalizeCommConfigs(dualSensor, [])
}

const COMM_ROLE_ORDER: DeviceRole[] = ["instrument", "instrument_b", "data_stick", "power_supply"]

/** 按井配置规则整理通信项：保留已填写的各角色，补齐缺失项，双传感器时强制 instrument_b */
export function normalizeCommConfigs(
  dualSensor: boolean,
  configs: WellCommConfig[] = []
): WellCommConfig[] {
  const byRole = new Map<DeviceRole, WellCommConfig>()
  for (const item of configs) {
    if (!item?.deviceRole || byRole.has(item.deviceRole)) continue
    byRole.set(item.deviceRole, { ...item })
  }

  const ordered: WellCommConfig[] = []

  ordered.push(byRole.get("instrument") ?? createUsbCommConfig("instrument"))

  if (dualSensor) {
    ordered.push(byRole.get("instrument_b") ?? createUsbCommConfig("instrument_b"))
  }

  const dataStick = byRole.get("data_stick")
  if (dataStick) {
    ordered.push(dataStick)
  }

  ordered.push(byRole.get("power_supply") ?? createPowerCommConfig())

  return ordered.filter((item) => {
    if (item.deviceRole === "instrument_b") return dualSensor
    return COMM_ROLE_ORDER.includes(item.deviceRole)
  })
}

/** @deprecated use createUsbCommConfig */
export function createEmptyCommConfig(): WellCommConfig {
  return createUsbCommConfig("instrument")
}

function readDeviceRole(raw: ApiWellCommConfig): DeviceRole | undefined {
  const item = raw as ApiWellCommConfig & { deviceRole?: DeviceRole }
  return item.deviceRole ?? raw.device_role
}

function mapLegacyComm(raw: ApiWellCommConfig): WellCommConfig | null {
  if (readDeviceRole(raw)) {
    return null
  }
  const port = raw.port_legacy ?? (raw as { port?: string }).port ?? ""
  if (!port) return null
  return {
    deviceRole: "instrument",
    vid: "0403",
    pid: "6001",
    adapterSerial: port,
    baudRate: Number(raw.baud_rate ?? 115200) || 115200
  }
}

export function mapCommFromApi(raw: ApiWellCommConfig): WellCommConfig {
  const deviceRole = readDeviceRole(raw)
  if (!deviceRole) {
    const legacy = mapLegacyComm(raw)
    if (legacy) return legacy
  }
  const role = (deviceRole ?? "instrument") as DeviceRole
  const item = raw as ApiWellCommConfig & {
    adapterSerial?: string
    baudRate?: number
  }
  if (role === "power_supply") {
    return {
      deviceRole: role,
      transport: raw.transport ?? "lan",
      host: raw.host ?? "",
      port: raw.port ?? 30000
    }
  }
  return {
    deviceRole: role,
    vid: raw.vid ?? "0403",
    pid: raw.pid ?? "6001",
    adapterSerial: raw.adapter_serial ?? item.adapterSerial ?? "",
    baudRate: Number(raw.baud_rate ?? item.baudRate ?? 115200) || 115200
  }
}

export function mapWellFromApi(raw: ApiCalibrationWell): CalibrationWell {
  const dualSensor = raw.dual_sensor ?? false
  const coeffDefaults = defaultCoeffRanges(raw.well_type, dualSensor)
  const commConfigs = normalizeCommConfigs(
    dualSensor,
    (raw.comm_configs ?? []).map(mapCommFromApi)
  )
  const well: CalibrationWell = {
    id: raw.id,
    wellNo: raw.well_no,
    wellName: raw.well_name,
    wellType: raw.well_type,
    wellTypeText: raw.well_type_text,
    apiValue: raw.api_value != null ? Number(raw.api_value) : null,
    dualSensor,
    holeDiameter: raw.hole_diameter,
    commConfigs,
    dataSource: raw.data_source ?? "live",
    refMin: readNumber(raw.ref_min, coeffDefaults.refMin),
    refMax: readNumber(raw.ref_max, coeffDefaults.refMax),
    kaMin: readNumber(raw.ka_min, coeffDefaults.kaMin),
    kaMax: readNumber(raw.ka_max, coeffDefaults.kaMax),
    baLimit: readNumber(raw.ba_limit, coeffDefaults.baLimit),
    kbMin: readNumber(raw.kb_min, coeffDefaults.kbMin),
    kbMax: readNumber(raw.kb_max, coeffDefaults.kbMax),
    bbLimit: readNumber(raw.bb_limit, coeffDefaults.bbLimit),
    status: raw.status,
    remark: raw.remark ?? ""
  }
  if (!dualSensor && well.kaMin === 0 && well.kaMax === 0) {
    well.kaMin = well.kbMin
    well.kaMax = well.kbMax
    well.baLimit = well.bbLimit
  }
  return well
}

export function wellToForm(well: CalibrationWell): WellFormModel {
  return {
    wellNo: well.wellNo,
    wellName: well.wellName,
    wellType: well.wellType,
    apiValue: well.apiValue,
    dualSensor: well.dualSensor,
    holeDiameter: well.holeDiameter,
    commConfigs: normalizeCommConfigs(
      well.dualSensor,
      well.commConfigs.map((item) => ({ ...item }))
    ),
    refMin: well.refMin,
    refMax: well.refMax,
    kaMin: well.kaMin,
    kaMax: well.kaMax,
    baLimit: well.baLimit,
    kbMin: well.kbMin,
    kbMax: well.kbMax,
    bbLimit: well.bbLimit,
    status: well.status,
    remark: well.remark
  }
}

function commToPayload(item: WellCommConfig): Record<string, unknown> {
  if (item.deviceRole === "power_supply") {
    return {
      deviceRole: item.deviceRole,
      transport: item.transport ?? "lan",
      host: (item.host ?? "").trim(),
      port: item.port ?? 30000
    }
  }
  return {
    deviceRole: item.deviceRole,
    vid: (item.vid ?? "").trim(),
    pid: (item.pid ?? "").trim(),
    adapterSerial: (item.adapterSerial ?? "").trim(),
    baudRate: item.baudRate ?? 115200
  }
}

export function formToWellPayload(form: WellFormModel, isEdit: boolean) {
  const commConfigs = normalizeCommConfigs(form.dualSensor, form.commConfigs)
  const payload: Record<string, unknown> = {
    wellName: form.wellName.trim(),
    wellType: form.wellType,
    apiValue: form.apiValue,
    dualSensor: form.dualSensor,
    holeDiameter: form.holeDiameter,
    commConfigs: commConfigs.map(commToPayload),
    dataSource: "live",
    refMin: form.refMin,
    refMax: form.refMax,
    baLimit: form.baLimit,
    status: form.status,
    remark: form.remark.trim()
  }
  if (form.dualSensor) {
    payload.kaMin = form.kaMin
    payload.kaMax = form.kaMax
    payload.kbMin = form.kbMin
    payload.kbMax = form.kbMax
    payload.bbLimit = form.bbLimit
  } else {
    payload.kaMin = form.kaMin
    payload.kaMax = form.kaMax
    payload.kbMin = form.kaMin
    payload.kbMax = form.kaMax
    payload.bbLimit = form.baLimit
  }
  if (!isEdit) {
    payload.wellNo = form.wellNo.trim()
  }
  return payload
}

export function formatCommSummary(well: Pick<CalibrationWell, "dualSensor" | "commConfigs">) {
  const configs = well.commConfigs ?? []
  if (!configs.length) return "—"
  const inst = configs.find((c) => c.deviceRole === "instrument") ?? configs[0]
  if (inst.deviceRole === "power_supply") {
    return `${inst.host}:${inst.port}`
  }
  const base = `${inst.vid}:${inst.pid}/${inst.adapterSerial || "—"}`
  if (well.dualSensor && configs.some((c) => c.deviceRole === "instrument_b")) {
    return `${base} +B`
  }
  return base
}

export function isPowerConfig(item: WellCommConfig): boolean {
  return item.deviceRole === "power_supply"
}

export function isUsbConfig(item: WellCommConfig): boolean {
  return item.deviceRole !== "power_supply"
}
