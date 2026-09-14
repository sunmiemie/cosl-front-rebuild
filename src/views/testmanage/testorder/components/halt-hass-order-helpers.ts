import type {
  HaltHassCircuitBoardStatus,
  HaltHassExperimentType,
  HaltHassOrderCreateParams
} from "@/api/halt-hass/types"

export interface HaltHassCreateFormModel {
  productModelId: number | null
  clientTestType: 1 | 2 | null
  boardGroupId: number | null
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
  taskExecutionDescription: string
  cycleCount: number
  workbenchTestName?: string
  remark: string
}

export interface SelectedHaltHassBoard {
  id: number
  serial: string
  boardModelId: number
  boardModelName: string
  boardModelCode?: string
}

export interface BuildHaltHassCreatePayloadParams {
  form: HaltHassCreateFormModel
  creatorId: number
  boardCount: number
  selectedBoards: SelectedHaltHassBoard[]
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

export const isHaltHassCreateFormReady = (form: HaltHassCreateFormModel, allBoardsSelected: boolean) => {
  const requiredValues = [
    form.productModelId,
    form.clientTestType,
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
    form.taskExecutionDescription,
    form.workbenchTestName
  ]

  const baseReady = allBoardsSelected && requiredValues.every((value) => trimValue(value))
  if (!baseReady) return false

  return Number.isInteger(Number(form.cycleCount)) && Number(form.cycleCount) > 0
}

export const buildHaltHassCreatePayload = ({
  form,
  creatorId,
  boardCount,
  selectedBoards
}: BuildHaltHassCreatePayloadParams): HaltHassOrderCreateParams => {
  const boardSerials = selectedBoards.map((board) => ({
    serial: board.serial,
    boardModelId: board.boardModelId,
    boardModelName: board.boardModelName,
    boardModelCode: board.boardModelCode || ""
  }))
  const boardSerialsSnake = boardSerials.map((board) => ({
    serial: board.serial,
    board_model_id: board.boardModelId,
    board_model_name: board.boardModelName,
    board_model_code: board.boardModelCode || ""
  }))

  const payload: HaltHassOrderCreateParams = {
    productModelId: form.productModelId!,
    product_model_id: form.productModelId!,
    boardGroupId: form.boardGroupId!,
    boardCount,
    creatorId,
    board_group_id: form.boardGroupId!,
    board_count: boardCount,
    creator_id: creatorId,
    cycleCount: Number(form.cycleCount),
    cycle_count: Number(form.cycleCount),
    taskExecutionDescription: trimValue(form.taskExecutionDescription),
    task_execution_description: trimValue(form.taskExecutionDescription),
    workbenchTestName: trimValue(form.workbenchTestName),
    workbench_test_name: trimValue(form.workbenchTestName),
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
    circuit_board_status: form.circuitBoardStatus as HaltHassCircuitBoardStatus
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
