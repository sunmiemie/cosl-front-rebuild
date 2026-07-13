import type {
  HaltHassCircuitBoardStatus,
  HaltHassExperimentType,
  HaltHassOrderCreateParams,
  HaltHassProcessSelectionType,
  HaltHassVersionItem
} from "@/api/halt-hass/types"

export const OTHER_PROCESS_VALUE = "other"

export type HaltHassProcessSelection = number | typeof OTHER_PROCESS_VALUE | ""

export interface HaltHassCreateFormModel {
  boardGroupId: number | null
  processId?: number | null
  processSelection: HaltHassProcessSelection
  testApplicationUnit: string
  researchNumber: string
  projectBudgetNumber: string
  projectName: string
  address: string
  applicant: string
  phone: string
  mobile: string
  experimentType: HaltHassExperimentType | ""
  circuitBoardStatus: HaltHassCircuitBoardStatus | ""
  otherProcessName: string
  cycleCount: number
  singleCycleDurationHours: number | null
  remark: string
}

export interface SelectedHaltHassBoard {
  id: number
  serial: string
}

export interface BuildHaltHassCreatePayloadParams {
  form: HaltHassCreateFormModel
  creatorId: number
  boardCount: number
  selectedBoards: Record<number, SelectedHaltHassBoard>
}

const EXPERIMENT_TYPE_LABELS: Record<HaltHassExperimentType, string> = {
  halt: "HALT（高温-低温-振动三项）",
  hass: "HASS"
}

const CIRCUIT_BOARD_STATUS_LABELS: Record<HaltHassCircuitBoardStatus, string> = {
  development: "研发",
  fault_excitation: "故障激发",
  manufacturing: "制造"
}

const trimValue = (value: unknown) => String(value ?? "").trim()

const isPositiveTwoDecimalNumber = (value: unknown) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue > 0 && Math.abs(numericValue * 100 - Math.round(numericValue * 100)) < 1e-8
}

export const normalizeHaltHassExperimentType = (process: HaltHassVersionItem): HaltHassExperimentType | "" => {
  const directType = trimValue(process.experimentType ?? process.experiment_type).toLowerCase()
  if (directType === "halt" || directType === "hass") return directType

  const text = `${process.name || ""} ${process.version || ""}`.toLowerCase()
  if (text.includes("hass")) return "hass"
  if (text.includes("halt") || text.includes("高温") || text.includes("低温") || text.includes("振动")) return "halt"

  return ""
}

export const filterHaltHassProcesses = (
  processes: HaltHassVersionItem[],
  experimentType: HaltHassExperimentType | ""
) => {
  return processes.filter((process) => {
    if (process.status !== 3) return false
    if (!experimentType) return true

    const normalizedType = normalizeHaltHassExperimentType(process)
    return !normalizedType || normalizedType === experimentType
  })
}

export const isHaltHassCreateFormReady = (form: HaltHassCreateFormModel, allBoardsSelected: boolean) => {
  const requiredValues = [
    form.boardGroupId,
    form.testApplicationUnit,
    form.researchNumber,
    form.projectBudgetNumber,
    form.projectName,
    form.address,
    form.applicant,
    form.phone,
    form.mobile,
    form.experimentType,
    form.circuitBoardStatus,
    form.processSelection
  ]

  const baseReady = allBoardsSelected && requiredValues.every((value) => trimValue(value))
  if (!baseReady) return false

  if (!Number.isInteger(Number(form.cycleCount)) || Number(form.cycleCount) <= 0) return false
  if (!isPositiveTwoDecimalNumber(form.singleCycleDurationHours)) return false

  if (form.processSelection === OTHER_PROCESS_VALUE) {
    return Boolean(trimValue(form.otherProcessName))
  }

  return Number.isFinite(Number(form.processSelection))
}

export const buildHaltHassCreatePayload = ({
  form,
  creatorId,
  boardCount,
  selectedBoards
}: BuildHaltHassCreatePayloadParams): HaltHassOrderCreateParams => {
  const isOtherProcess = form.processSelection === OTHER_PROCESS_VALUE
  const selectedProcessId = isOtherProcess ? null : Number(form.processSelection)
  const processSelection: HaltHassProcessSelectionType = isOtherProcess ? "other" : "existing"
  const boardSerials = Object.entries(selectedBoards).map(([boardModelId, board]) => ({
    serial: board.serial,
    boardModelId: Number(boardModelId)
  }))
  const boardSerialsSnake = boardSerials.map((board) => ({
    serial: board.serial,
    board_model_id: board.boardModelId
  }))

  const payload: HaltHassOrderCreateParams = {
    boardGroupId: form.boardGroupId!,
    boardCount,
    creatorId,
    board_group_id: form.boardGroupId!,
    board_count: boardCount,
    creator_id: creatorId,
    cycleCount: Number(form.cycleCount),
    cycle_count: Number(form.cycleCount),
    remark: form.remark,
    boardSerials,
    board_serials: boardSerialsSnake,
    testApplicationUnit: form.testApplicationUnit,
    test_application_unit: form.testApplicationUnit,
    researchNumber: form.researchNumber,
    research_number: form.researchNumber,
    projectBudgetNumber: form.projectBudgetNumber,
    project_budget_number: form.projectBudgetNumber,
    projectName: form.projectName,
    project_name: form.projectName,
    address: form.address,
    applicant: form.applicant,
    phone: form.phone,
    mobile: form.mobile,
    experimentType: form.experimentType as HaltHassExperimentType,
    experiment_type: form.experimentType as HaltHassExperimentType,
    circuitBoardStatus: form.circuitBoardStatus as HaltHassCircuitBoardStatus,
    circuit_board_status: form.circuitBoardStatus as HaltHassCircuitBoardStatus,
    processSelection,
    process_selection: processSelection,
    singleCycleDurationHours: Number(form.singleCycleDurationHours),
    single_cycle_duration_hours: Number(form.singleCycleDurationHours)
  }

  if (isOtherProcess) {
    payload.otherProcessName = form.otherProcessName
    payload.other_process_name = form.otherProcessName
  } else {
    payload.processId = selectedProcessId
    payload.process_id = selectedProcessId
  }

  return payload
}

export const getHaltHassOrderField = (order: Record<string, unknown>, camelKey: string, snakeKey: string) => {
  const value = order[camelKey] ?? order[snakeKey]
  return trimValue(value) || "-"
}

export const getHaltHassExperimentTypeText = (value?: string) => {
  return EXPERIMENT_TYPE_LABELS[value as HaltHassExperimentType] || "-"
}

export const getHaltHassCircuitBoardStatusText = (value?: string) => {
  return CIRCUIT_BOARD_STATUS_LABELS[value as HaltHassCircuitBoardStatus] || "-"
}
