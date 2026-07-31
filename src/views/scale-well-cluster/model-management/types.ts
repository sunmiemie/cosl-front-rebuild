import type { ApiCalibrationInstrumentModel } from "@/api/calibration-well/types"

/** 刻度设备型号 */
export interface CalibrationDeviceModel {
  id: number
  displayName: string
  serialNumbers: string[]
  serialCount: number
  hiWellId: number
  loWellId: number
  hiWellNo: string
  loWellNo: string
  hiWellApi: number | null
  loWellApi: number | null
  hiWellDualSensor: boolean
  hiWellKaMin: number
  hiWellKaMax: number
  hiWellBaLimit: number
  loWellKbMin: number
  loWellKbMax: number
  loWellBbLimit: number
  status: number
  remark: string
}

export interface DeviceModelFilter {
  keyword: string
  status: string
  page: number
  pageSize: number
}

export interface DeviceModelFormModel {
  displayName: string
  serialNumbers: string[]
  hiWellId: number | null
  loWellId: number | null
  status: number
  remark: string
}

function readNum(raw: string | number | null | undefined, fallback = 0) {
  if (raw == null || raw === "") return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

export function mapModelFromApi(raw: ApiCalibrationInstrumentModel): CalibrationDeviceModel {
  return {
    id: raw.id,
    displayName: raw.display_name,
    serialNumbers: raw.serial_numbers ?? [],
    serialCount: raw.serial_count ?? (raw.serial_numbers?.length ?? 0),
    hiWellId: raw.hi_well_id,
    loWellId: raw.lo_well_id,
    hiWellNo: raw.hi_well_no ?? "",
    loWellNo: raw.lo_well_no ?? "",
    hiWellApi: raw.hi_well_api != null ? Number(raw.hi_well_api) : null,
    loWellApi: raw.lo_well_api != null ? Number(raw.lo_well_api) : null,
    hiWellDualSensor: raw.hi_well_dual_sensor ?? false,
    hiWellKaMin: readNum(raw.hi_well_ka_min),
    hiWellKaMax: readNum(raw.hi_well_ka_max),
    hiWellBaLimit: readNum(raw.hi_well_ba_limit, 4),
    loWellKbMin: readNum(raw.lo_well_kb_min, 3.5),
    loWellKbMax: readNum(raw.lo_well_kb_max, 5.5),
    loWellBbLimit: readNum(raw.lo_well_bb_limit, 4),
    status: raw.status,
    remark: raw.remark ?? ""
  }
}

export function modelToForm(model: CalibrationDeviceModel): DeviceModelFormModel {
  return {
    displayName: model.displayName,
    serialNumbers: [...model.serialNumbers],
    hiWellId: model.hiWellId,
    loWellId: model.loWellId,
    status: model.status,
    remark: model.remark
  }
}

export function formToModelPayload(form: DeviceModelFormModel) {
  return {
    displayName: form.displayName.trim(),
    serialNumbers: form.serialNumbers.map((s) => s.trim()).filter(Boolean),
    hiWellId: form.hiWellId,
    loWellId: form.loWellId,
    status: form.status,
    remark: form.remark.trim()
  }
}

export function formatModelCoeffSummary(model: Pick<
  CalibrationDeviceModel,
  "hiWellDualSensor" | "hiWellKaMin" | "hiWellKaMax" | "hiWellBaLimit" | "loWellKbMin" | "loWellKbMax" | "loWellBbLimit"
>) {
  if (model.hiWellDualSensor) {
    return `A: Ka[${model.hiWellKaMin},${model.hiWellKaMax}] Ba±${model.hiWellBaLimit} · B: Kb[${model.loWellKbMin},${model.loWellKbMax}] Bb±${model.loWellBbLimit}`
  }
  return `A: Ka[${model.hiWellKaMin},${model.hiWellKaMax}] Ba±${model.hiWellBaLimit}`
}
